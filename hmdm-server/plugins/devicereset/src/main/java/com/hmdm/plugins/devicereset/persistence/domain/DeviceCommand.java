package com.hmdm.plugins.devicereset.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.annotations.ApiModelProperty;

import java.io.Serializable;

/**
 * A queued device command (reboot, and later factory reset).
 *
 * Unlike a PIN reset, the launcher confirms these BEFORE acting - it cannot report
 * back after wiping or rebooting itself. So STATUS_CONFIRMED means "the device
 * acknowledged and is about to do it", not "it finished".
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeviceCommand implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    public static final String TYPE_REBOOT = "reboot";
    public static final String TYPE_FACTORY_RESET = "factoryreset";

    public static final int STATUS_PENDING = 0;
    public static final int STATUS_DELIVERED = 1;
    public static final int STATUS_CONFIRMED = 2;

    @ApiModelProperty("Record ID")
    private Integer id;

    @ApiModelProperty("Customer ID")
    private int customerId;

    @ApiModelProperty("Device ID")
    private int deviceId;

    @ApiModelProperty("Device number")
    private String deviceNumber;

    @ApiModelProperty("Command type: reboot or factoryreset")
    private String commandType;

    @ApiModelProperty("Login of the admin who issued the command")
    private String requestedBy;

    @ApiModelProperty("When the command was issued (ms since epoch)")
    private long requestTime;

    @ApiModelProperty("When the command was handed to the device (ms since epoch)")
    private Long deliverTime;

    @ApiModelProperty("When the device acknowledged the command (ms since epoch)")
    private Long confirmTime;

    @ApiModelProperty("0 = pending, 1 = sent to device, 2 = acknowledged")
    private int status;

    /**
     * What the device said about itself when it acknowledged: true if it has the
     * rights to carry the command out, false if it does not, null if it never said.
     */
    @ApiModelProperty("Whether the device reported it can perform the command")
    private Boolean deviceCapable;

    public DeviceCommand() {
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

    public String getCommandType() { return commandType; }
    public void setCommandType(String commandType) { this.commandType = commandType; }

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

    public Boolean getDeviceCapable() { return deviceCapable; }
    public void setDeviceCapable(Boolean deviceCapable) { this.deviceCapable = deviceCapable; }
}
