package com.hmdm.plugins.devicereset.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/**
 * Lock state for one device. Unlike reboot and factory reset this is not a
 * one-shot command: the flag is sent on every sync until an admin clears it.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeviceLock implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Device ID (primary key - one row per device)")
    private int deviceId;

    @Schema(description = "Customer ID")
    private int customerId;

    @Schema(description = "Device number")
    private String deviceNumber;

    @Schema(description = "Whether the device is currently locked")
    private boolean locked;

    @Schema(description = "Message shown on the device's lock screen")
    private String lockMessage;

    @Schema(description = "Login of the admin who last changed the lock state")
    private String requestedBy;

    @Schema(description = "When the lock state last changed (ms since epoch)")
    private long updateTime;

    public DeviceLock() {
    }

    /** CustomerData requires an id; the device id is this row's identity. */
    public Integer getId() { return deviceId; }

    public int getDeviceId() { return deviceId; }
    public void setDeviceId(int deviceId) { this.deviceId = deviceId; }

    @Override
    public int getCustomerId() { return customerId; }
    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public String getDeviceNumber() { return deviceNumber; }
    public void setDeviceNumber(String deviceNumber) { this.deviceNumber = deviceNumber; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }

    public String getLockMessage() { return lockMessage; }
    public void setLockMessage(String lockMessage) { this.lockMessage = lockMessage; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public long getUpdateTime() { return updateTime; }
    public void setUpdateTime(long updateTime) { this.updateTime = updateTime; }
}
