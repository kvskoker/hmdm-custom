package com.hmdm.plugins.devicereset.sync;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.plugins.devicereset.persistence.DeviceResetDAO;
import com.hmdm.plugins.devicereset.persistence.domain.DeviceCommand;
import com.hmdm.plugins.devicereset.persistence.domain.DeviceLock;
import com.hmdm.plugins.devicereset.persistence.domain.PasswordReset;
import com.hmdm.rest.json.SyncResponseHook;
import com.hmdm.rest.json.SyncResponseInt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Adds this plugin's pending instructions to a device's configuration sync response.
 *
 * The launcher processes them in the order: factory reset, reboot, password reset.
 * Reboot and factory reset confirm to the server BEFORE acting; the password reset
 * confirms after. Either way the confirmation clears the pending row, so an
 * instruction keeps being re-sent until the device acknowledges it - which is what
 * makes this survive a device being offline.
 */
@Singleton
public class DeviceResetSyncHook implements SyncResponseHook {

    private static final Logger log = LoggerFactory.getLogger(DeviceResetSyncHook.class);

    private final DeviceResetDAO dao;

    @Inject
    public DeviceResetSyncHook(DeviceResetDAO dao) {
        this.dao = dao;
    }

    @Override
    public SyncResponseInt handle(int deviceId, SyncResponseInt original) {
        // Order mirrors how the launcher processes them: wipe, reboot, then PIN.
        applyFactoryReset(deviceId, original);
        applyReboot(deviceId, original);
        applyPasswordReset(deviceId, original);
        applyLock(deviceId, original);
        return original;
    }

    private void applyPasswordReset(int deviceId, SyncResponseInt response) {
        try {
            PasswordReset pending = this.dao.findPending(deviceId);
            if (pending == null) {
                return;
            }
            response.setPasswordReset(pending.getNewPassword());
            if (pending.getStatus() == PasswordReset.STATUS_PENDING) {
                this.dao.markDelivered(pending.getId());
            }
            log.info("Delivered PIN reset request {} to device id {}", pending.getId(), deviceId);
        } catch (Exception e) {
            // Never let this break device synchronization.
            log.error("Failed to evaluate pending PIN reset for device id " + deviceId, e);
        }
    }

    private void applyReboot(int deviceId, SyncResponseInt response) {
        try {
            DeviceCommand pending = this.dao.findPendingCommand(deviceId, DeviceCommand.TYPE_REBOOT);
            if (pending == null) {
                return;
            }
            response.setReboot(Boolean.TRUE);
            if (pending.getStatus() == DeviceCommand.STATUS_PENDING) {
                this.dao.markCommandDelivered(pending.getId());
            }
            log.info("Delivered reboot command {} to device id {}", pending.getId(), deviceId);
        } catch (Exception e) {
            log.error("Failed to evaluate pending reboot for device id " + deviceId, e);
        }
    }

    private void applyFactoryReset(int deviceId, SyncResponseInt response) {
        try {
            DeviceCommand pending =
                    this.dao.findPendingCommand(deviceId, DeviceCommand.TYPE_FACTORY_RESET);
            if (pending == null) {
                return;
            }
            response.setFactoryReset(Boolean.TRUE);
            if (pending.getStatus() == DeviceCommand.STATUS_PENDING) {
                this.dao.markCommandDelivered(pending.getId());
            }
            log.warn("Delivered FACTORY RESET command {} to device id {}", pending.getId(), deviceId);
        } catch (Exception e) {
            log.error("Failed to evaluate pending factory reset for device id " + deviceId, e);
        }
    }

    /**
     * Lock is state rather than a command, so it is sent on every sync while set.
     * Sending lock=false explicitly is what releases a device that was locked.
     */
    private void applyLock(int deviceId, SyncResponseInt response) {
        try {
            DeviceLock lock = this.dao.findLock(deviceId);
            if (lock == null) {
                return;
            }
            response.setLock(lock.isLocked());
            if (lock.isLocked()) {
                response.setLockMessage(lock.getLockMessage());
            }
        } catch (Exception e) {
            log.error("Failed to evaluate lock state for device id " + deviceId, e);
        }
    }
}
