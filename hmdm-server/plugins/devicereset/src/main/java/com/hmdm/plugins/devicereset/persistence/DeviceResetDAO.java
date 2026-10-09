package com.hmdm.plugins.devicereset.persistence;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.plugins.devicereset.persistence.domain.DeviceCommand;
import com.hmdm.plugins.devicereset.persistence.domain.DeviceLock;
import com.hmdm.plugins.devicereset.persistence.domain.PasswordReset;
import com.hmdm.plugins.devicereset.persistence.mapper.DeviceCommandMapper;
import com.hmdm.plugins.devicereset.persistence.mapper.DeviceLockMapper;
import com.hmdm.plugins.devicereset.persistence.mapper.PasswordResetMapper;
import com.hmdm.security.SecurityContext;
import org.mybatis.guice.transactional.Transactional;

import java.util.Collections;
import java.util.List;

@Singleton
public class DeviceResetDAO {

    private final PasswordResetMapper mapper;
    private final DeviceCommandMapper commandMapper;
    private final DeviceLockMapper lockMapper;

    @Inject
    public DeviceResetDAO(PasswordResetMapper mapper,
                          DeviceCommandMapper commandMapper,
                          DeviceLockMapper lockMapper) {
        this.mapper = mapper;
        this.commandMapper = commandMapper;
        this.lockMapper = lockMapper;
    }

    /**
     * Records a new PIN reset request, superseding any request still outstanding
     * for the same device.
     */
    @Transactional
    public PasswordReset request(int deviceId, int customerId, String pin, String requestedBy) {
        long now = System.currentTimeMillis();
        this.mapper.cancelOutstanding(deviceId, now);

        PasswordReset record = new PasswordReset();
        record.setCustomerId(customerId);
        record.setDeviceId(deviceId);
        record.setNewPassword(pin);
        record.setRequestedBy(requestedBy);
        record.setRequestTime(now);
        record.setStatus(PasswordReset.STATUS_PENDING);
        this.mapper.insert(record);
        return record;
    }

    public PasswordReset findPending(int deviceId) {
        return this.mapper.findPendingByDevice(deviceId);
    }

    public void markDelivered(int id) {
        this.mapper.markDelivered(id, System.currentTimeMillis());
    }

    public void markConfirmed(int deviceId) {
        this.mapper.markConfirmed(deviceId, System.currentTimeMillis());
    }

    public List<PasswordReset> history() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.mapper.findAllByCustomer(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    public java.util.Map<String, Object> historyPage(String kind, int page, int size,
            String search, Integer status, String commandType, long after) {
        return SecurityContext.get().getCurrentUser().map(user -> {
            java.util.Map<String, Object> args = new java.util.HashMap<>();
            args.put("kind", kind);
            args.put("customerId", user.getCustomerId());
            args.put("userId", user.getId());
            args.put("pageSize", size);
            args.put("offset", (long) page * size);
            args.put("search", "%" + search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%");
            args.put("status", status);
            args.put("commandType", commandType);
            args.put("after", after);
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("items", this.mapper.historyPage(args));
            result.put("totalItemsCount", this.mapper.historyCount(args));
            return result;
        }).orElseGet(() -> java.util.Map.of("items", Collections.emptyList(), "totalItemsCount", 0));
    }

    // ---------------------------------------------------------------- commands

    /**
     * Queues a command, replacing any of the same type still outstanding for the
     * device so a double click does not reboot the device twice.
     */
    @Transactional
    public DeviceCommand queueCommand(int deviceId, int customerId, String commandType,
                                      String requestedBy) {
        long now = System.currentTimeMillis();
        this.commandMapper.markConfirmed(deviceId, commandType, now);

        DeviceCommand record = new DeviceCommand();
        record.setCustomerId(customerId);
        record.setDeviceId(deviceId);
        record.setCommandType(commandType);
        record.setRequestedBy(requestedBy);
        record.setRequestTime(now);
        record.setStatus(DeviceCommand.STATUS_PENDING);
        this.commandMapper.insert(record);
        return record;
    }

    public DeviceCommand findPendingCommand(int deviceId, String commandType) {
        return this.commandMapper.findPending(deviceId, commandType);
    }

    public void markCommandDelivered(int id) {
        this.commandMapper.markDelivered(id, System.currentTimeMillis());
    }

    public void markCommandConfirmed(int deviceId, String commandType) {
        this.commandMapper.markConfirmed(deviceId, commandType, System.currentTimeMillis());
    }

    /** Records the device's own statement of whether it can carry the command out. */
    public void markCommandConfirmed(int deviceId, String commandType, Boolean deviceCapable) {
        if (deviceCapable == null) {
            markCommandConfirmed(deviceId, commandType);
            return;
        }
        this.commandMapper.markConfirmedWithCapability(
                deviceId, commandType, System.currentTimeMillis(), deviceCapable);
    }

    public List<DeviceCommand> commandHistory() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.commandMapper.findAllByCustomer(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    // ------------------------------------------------------------------- lock

    /**
     * Sets or clears the lock. One row per device, so locking twice is harmless
     * and unlocking is just the same call with locked = false.
     */
    @Transactional
    public DeviceLock setLock(int deviceId, int customerId, boolean locked,
                              String message, String requestedBy) {
        DeviceLock record = new DeviceLock();
        record.setDeviceId(deviceId);
        record.setCustomerId(customerId);
        record.setLocked(locked);
        record.setLockMessage(locked ? message : null);
        record.setRequestedBy(requestedBy);
        record.setUpdateTime(System.currentTimeMillis());
        this.lockMapper.upsert(record);
        return record;
    }

    public DeviceLock findLock(int deviceId) {
        return this.lockMapper.findByDevice(deviceId);
    }

    public List<DeviceLock> lockedDevices() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.lockMapper.findLocked(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }
}
