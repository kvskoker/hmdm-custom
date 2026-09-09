package com.hmdm.plugins.devicereset.rest;

import com.hmdm.notification.PushService;
import com.hmdm.persistence.DeviceDAO;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Device;
import com.hmdm.plugins.devicereset.persistence.DeviceResetDAO;
import com.hmdm.plugins.devicereset.persistence.domain.DeviceCommand;
import com.hmdm.plugins.devicereset.persistence.domain.DeviceLock;
import com.hmdm.plugins.devicereset.persistence.domain.PasswordReset;
import com.hmdm.plugins.devicereset.rest.json.ResetRequest;
import com.hmdm.plugins.devicereset.util.PinGenerator;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;

@Singleton
@Path("/plugins/devicereset")
@Api(tags = {"Device PIN reset plugin"})
public class DeviceResetResource {

    private static final Logger logger = LoggerFactory.getLogger(DeviceResetResource.class);

    private DeviceResetDAO deviceResetDAO;
    private DeviceDAO deviceDAO;
    private UnsecureDAO unsecureDAO;
    private PushService pushService;

    public DeviceResetResource() {
    }

    @Inject
    public DeviceResetResource(DeviceResetDAO deviceResetDAO,
                               DeviceDAO deviceDAO,
                               UnsecureDAO unsecureDAO,
                               PushService pushService) {
        this.deviceResetDAO = deviceResetDAO;
        this.deviceDAO = deviceDAO;
        this.unsecureDAO = unsecureDAO;
        this.pushService = pushService;
    }

    // =================================================================================================
    // Admin API

    /**
     * Generates a new PIN for a device and queues it for delivery. The PIN is
     * returned exactly once, in this response, for the admin to relay to the user.
     */
    @ApiOperation(
            value = "Reset device PIN",
            notes = "Generates a new lock screen PIN and queues it for the device. "
                  + "The generated PIN is returned once and never again.",
            authorizations = {@Authorization("Bearer Token")}
    )
    @POST
    @Path("/private/reset")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetPin(ResetRequest request) {
        try {
            if (request == null || request.getDeviceNumber() == null
                    || request.getDeviceNumber().trim().isEmpty()) {
                return Response.ERROR("error.device.number.required");
            }

            // Goes through DeviceDAO so the caller's device-group access is enforced.
            Device device = this.deviceDAO.getDeviceByNumber(request.getDeviceNumber().trim());
            if (device == null) {
                return Response.DEVICE_NOT_FOUND_ERROR();
            }

            int length = request.getPinLength() == null ? 6 : request.getPinLength();
            if (length > 16) {
                length = 16;
            }
            String pin = PinGenerator.generate(length);

            String login = SecurityContext.get().getCurrentUser()
                    .map(u -> u.getLogin()).orElse("unknown");

            PasswordReset record = this.deviceResetDAO.request(
                    device.getId(), device.getCustomerId(), pin, login);

            // Ask the device to sync now instead of waiting for its poll interval.
            try {
                this.pushService.notifyDeviceOnSettingUpdate(device.getId());
            } catch (Exception e) {
                logger.warn("PIN reset queued for device {} but push notification failed; "
                          + "the device will pick it up on its next sync", device.getNumber(), e);
            }

            logger.info("User {} requested a PIN reset for device {}", login, device.getNumber());

            Map<String, Object> result = new HashMap<>();
            result.put("id", record.getId());
            result.put("deviceNumber", device.getNumber());
            result.put("pin", pin);
            result.put("requestTime", record.getRequestTime());
            return Response.OK(result);

        } catch (Exception e) {
            logger.error("Failed to request a PIN reset", e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(
            value = "PIN reset history",
            notes = "Recent PIN reset requests for the current customer. PINs are not included.",
            authorizations = {@Authorization("Bearer Token")}
    )
    @GET
    @Path("/private/history")
    @Produces(MediaType.APPLICATION_JSON)
    public Response history() {
        try {
            return Response.OK(this.deviceResetDAO.history());
        } catch (Exception e) {
            logger.error("Failed to load PIN reset history", e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(
            value = "Reboot device",
            notes = "Queues a reboot. The device confirms and then reboots itself.",
            authorizations = {@Authorization("Bearer Token")}
    )
    @POST
    @Path("/private/reboot")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response reboot(ResetRequest request) {
        return queueCommand(request, DeviceCommand.TYPE_REBOOT);
    }

    @ApiOperation(
            value = "Command history",
            notes = "Recent reboot and reset commands for the current customer.",
            authorizations = {@Authorization("Bearer Token")}
    )
    @GET
    @Path("/private/commands")
    @Produces(MediaType.APPLICATION_JSON)
    public Response commandHistory() {
        try {
            return Response.OK(this.deviceResetDAO.commandHistory());
        } catch (Exception e) {
            logger.error("Failed to load command history", e);
            return Response.INTERNAL_ERROR();
        }
    }

    private Response queueCommand(ResetRequest request, String commandType) {
        try {
            if (request == null || request.getDeviceNumber() == null
                    || request.getDeviceNumber().trim().isEmpty()) {
                return Response.ERROR("error.device.number.required");
            }

            Device device = this.deviceDAO.getDeviceByNumber(request.getDeviceNumber().trim());
            if (device == null) {
                return Response.DEVICE_NOT_FOUND_ERROR();
            }

            String login = SecurityContext.get().getCurrentUser()
                    .map(u -> u.getLogin()).orElse("unknown");

            DeviceCommand record = this.deviceResetDAO.queueCommand(
                    device.getId(), device.getCustomerId(), commandType, login);

            try {
                this.pushService.notifyDeviceOnSettingUpdate(device.getId());
            } catch (Exception e) {
                logger.warn("Command {} queued for device {} but push failed; it will be picked up "
                          + "on the next sync", commandType, device.getNumber(), e);
            }

            logger.info("User {} issued command {} for device {}", login, commandType, device.getNumber());

            Map<String, Object> result = new HashMap<>();
            result.put("id", record.getId());
            result.put("deviceNumber", device.getNumber());
            result.put("commandType", commandType);
            return Response.OK(result);

        } catch (Exception e) {
            logger.error("Failed to queue command " + commandType, e);
            return Response.INTERNAL_ERROR();
        }
    }

    /**
     * Everything the page needs to tell an admin whether an action will work:
     * does the device exist, is it locked, and when did it last talk to us.
     *
     * Returns 200 with found=false rather than an error, because "no such device"
     * is a normal thing to type, not a failure.
     */
    @ApiOperation(
            value = "Device status",
            notes = "Existence, lock state and last sync time for one device number.",
            authorizations = {@Authorization("Bearer Token")}
    )
    @GET
    @Path("/private/status/{number}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deviceStatus(@PathParam("number") String number) {
        try {
            Map<String, Object> result = new HashMap<>();
            if (number == null || number.trim().isEmpty()) {
                result.put("found", false);
                return Response.OK(result);
            }

            Device device = this.deviceDAO.getDeviceByNumber(number.trim());
            if (device == null) {
                result.put("found", false);
                result.put("deviceNumber", number.trim());
                return Response.OK(result);
            }

            result.put("found", true);
            result.put("deviceNumber", device.getNumber());
            result.put("lastUpdate", device.getLastUpdate());

            DeviceLock lock = this.deviceResetDAO.findLock(device.getId());
            result.put("locked", lock != null && lock.isLocked());
            if (lock != null && lock.isLocked()) {
                result.put("lockMessage", lock.getLockMessage());
            }
            return Response.OK(result);

        } catch (Exception e) {
            logger.error("Failed to load status for device " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    /**
     * Wipes a device. Gated by its own permission, and the admin must retype the
     * device number - a button alone is too easy to click by accident for something
     * irreversible.
     */
    @ApiOperation(
            value = "Factory reset device",
            notes = "Queues an irreversible wipe. Requires the plugin_devicereset_wipe permission "
                  + "and a matching confirmDeviceNumber.",
            authorizations = {@Authorization("Bearer Token")}
    )
    @POST
    @Path("/private/factoryreset")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response factoryReset(ResetRequest request) {
        if (!SecurityContext.get().hasPermission("plugin_devicereset_wipe")) {
            logger.warn("Factory reset refused: caller lacks plugin_devicereset_wipe");
            return Response.PERMISSION_DENIED();
        }
        if (request == null || request.getDeviceNumber() == null
                || request.getConfirmDeviceNumber() == null
                || !request.getDeviceNumber().trim().equals(request.getConfirmDeviceNumber().trim())) {
            return Response.ERROR("plugin.devicereset.error.confirm.mismatch");
        }
        return queueCommand(request, DeviceCommand.TYPE_FACTORY_RESET);
    }

    @ApiOperation(value = "Lock device", authorizations = {@Authorization("Bearer Token")})
    @POST
    @Path("/private/lock")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response lock(ResetRequest request) {
        return setLock(request, true);
    }

    @ApiOperation(value = "Unlock device", authorizations = {@Authorization("Bearer Token")})
    @POST
    @Path("/private/unlock")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response unlock(ResetRequest request) {
        return setLock(request, false);
    }

    @ApiOperation(value = "Locked devices", authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/locked")
    @Produces(MediaType.APPLICATION_JSON)
    public Response lockedDevices() {
        try {
            return Response.OK(this.deviceResetDAO.lockedDevices());
        } catch (Exception e) {
            logger.error("Failed to load locked devices", e);
            return Response.INTERNAL_ERROR();
        }
    }

    private Response setLock(ResetRequest request, boolean locked) {
        try {
            if (request == null || request.getDeviceNumber() == null
                    || request.getDeviceNumber().trim().isEmpty()) {
                return Response.ERROR("error.device.number.required");
            }
            Device device = this.deviceDAO.getDeviceByNumber(request.getDeviceNumber().trim());
            if (device == null) {
                return Response.DEVICE_NOT_FOUND_ERROR();
            }

            String login = SecurityContext.get().getCurrentUser()
                    .map(u -> u.getLogin()).orElse("unknown");

            DeviceLock record = this.deviceResetDAO.setLock(
                    device.getId(), device.getCustomerId(), locked, request.getMessage(), login);

            try {
                this.pushService.notifyDeviceOnSettingUpdate(device.getId());
            } catch (Exception e) {
                logger.warn("Lock state changed for device {} but push failed; it applies on the "
                          + "next sync", device.getNumber(), e);
            }

            logger.info("User {} set lock={} on device {}", login, locked, device.getNumber());

            Map<String, Object> result = new HashMap<>();
            result.put("deviceNumber", device.getNumber());
            result.put("locked", record.isLocked());
            return Response.OK(result);

        } catch (Exception e) {
            logger.error("Failed to change lock state", e);
            return Response.INTERNAL_ERROR();
        }
    }

    // =================================================================================================
    // Device API - path and shape are dictated by the launcher (ServerService#confirmPasswordReset)

    @ApiOperation(value = "Confirm PIN reset", notes = "Called by the device after it applies a new PIN.")
    @POST
    @Path("/public/password/{number}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response confirmPasswordReset(@PathParam("number") String number, Object deviceInfo) {
        try {
            Device device = this.unsecureDAO.getDeviceByNumber(number);
            if (device == null) {
                logger.warn("PIN reset confirmation from unknown device number {}", number);
                return Response.DEVICE_NOT_FOUND_ERROR();
            }
            this.deviceResetDAO.markConfirmed(device.getId());
            logger.info("Device {} confirmed it applied the new PIN", number);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to record PIN reset confirmation for device " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Confirm reboot",
            notes = "Called by the device when it accepts a reboot command, just before rebooting.")
    @POST
    @Path("/public/reboot/{number}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response confirmReboot(@PathParam("number") String number, Object deviceInfo) {
        try {
            Device device = this.unsecureDAO.getDeviceByNumber(number);
            if (device == null) {
                logger.warn("Reboot confirmation from unknown device number {}", number);
                return Response.DEVICE_NOT_FOUND_ERROR();
            }
            this.deviceResetDAO.markCommandConfirmed(device.getId(), DeviceCommand.TYPE_REBOOT);
            logger.info("Device {} acknowledged the reboot command", number);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to record reboot confirmation for device " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Confirm factory reset",
            notes = "Called by the device when it accepts a wipe, immediately before wiping itself.")
    @POST
    @Path("/public/{number}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response confirmFactoryReset(@PathParam("number") String number,
                                        Map<String, Object> deviceInfo) {
        try {
            Device device = this.unsecureDAO.getDeviceByNumber(number);
            if (device == null) {
                logger.warn("Factory reset confirmation from unknown device number {}", number);
                return Response.DEVICE_NOT_FOUND_ERROR();
            }
            // The launcher sets deviceInfo.factoryReset to checkAdminMode() - its own
            // answer to "can I actually do this?" - just before confirming.
            Boolean capable = null;
            if (deviceInfo != null && deviceInfo.get("factoryReset") instanceof Boolean) {
                capable = (Boolean) deviceInfo.get("factoryReset");
            }
            this.deviceResetDAO.markCommandConfirmed(
                    device.getId(), DeviceCommand.TYPE_FACTORY_RESET, capable);

            if (Boolean.FALSE.equals(capable)) {
                logger.warn("Device {} acknowledged the FACTORY RESET command but reports it has "
                          + "NO RIGHTS to wipe itself - the device will not be erased", number);
            } else {
                logger.warn("Device {} acknowledged the FACTORY RESET command and is wiping itself",
                            number);
            }
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to record factory reset confirmation for device " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }
}