package com.hmdm.plugins.devicereset.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/**
 * A pending or completed lock-screen PIN reset for one device.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PasswordReset implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    /** Created, not yet handed to the device. */
    public static final int STATUS_PENDING = 0;
    /** Included in a sync response; the device has been told to apply it. */
    public static final int STATUS_DELIVERED = 1;
    /** The device confirmed it applied the new PIN. */
    public static final int STATUS_CONFIRMED = 2;

    @Schema(description = "Record ID")
    private Integer id;

    @Schema(description = "Customer ID")
    private int customerId;

    @Schema(description = "Device ID")
    private int deviceId;

    @Schema(description = "Device number")
    private String deviceNumber;

    /**
     * The PIN itself. Shown to the admin once at creation so they can pass it to
     * the user, and never returned by the history endpoint.
     */
    @JsonIgnore
    private String newPassword;

    @Schema(description = "Login of the admin who requested the reset")
    private String requestedBy;

    @Schema(description = "When the reset was requested (ms since epoch)")
    private long requestTime;

    @Schema(description = "When the PIN was handed to the device (ms since epoch)")
    private Long deliverTime;

    @Schema(description = "When the device confirmed it applied the PIN (ms since epoch)")
    private Long confirmTime;

    @Schema(description = "0 = pending, 1 = delivered, 2 = confirmed")
    private int status;

    public PasswordReset() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    @Override
    public int getCustomerId() { return customerId; }
    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public int getDeviceId() { return deviceId; }
    public void setDeviceId(int deviceId) { this.deviceId = deviceId; }

    public String getDeviceNumber() { return deviceNumber; }
    public void setDeviceNumber(String deviceNumber) { this.deviceNumber = deviceNumber; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public long getRequestTime() { return requestTime; }
    public void setRequestTime(long requestTime) { this.requestTime = requestTime; }

    public Long getDeliverTime() { return deliverTime; }
    public void setDeliverTime(Long deliverTime) { this.deliverTime = deliverTime; }

    public Long getConfirmTime() { return confirmTime; }
    public void setConfirmTime(Long confirmTime) { this.confirmTime = confirmTime; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}
