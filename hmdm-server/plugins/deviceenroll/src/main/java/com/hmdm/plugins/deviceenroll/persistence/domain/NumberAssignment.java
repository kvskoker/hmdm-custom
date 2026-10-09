package com.hmdm.plugins.deviceenroll.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/** A number this plugin has handed out. Its existence is what stops a device being renumbered twice. */
@JsonIgnoreProperties(ignoreUnknown = true)
public class NumberAssignment implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    private int deviceId;
    private int customerId;

    @Schema(description = "The number the device enrolled with, usually its serial")
    private String originalNumber;

    @Schema(description = "The number allocated to it")
    private String assignedNumber;

    @Schema(description = "When it was allocated (ms since epoch)")
    private long assignTime;

    public NumberAssignment() {
    }

    public Integer getId() { return deviceId; }

    public int getDeviceId() { return deviceId; }
    public void setDeviceId(int deviceId) { this.deviceId = deviceId; }

    @Override
    public int getCustomerId() { return customerId; }
    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public String getOriginalNumber() { return originalNumber; }
    public void setOriginalNumber(String originalNumber) { this.originalNumber = originalNumber; }

    public String getAssignedNumber() { return assignedNumber; }
    public void setAssignedNumber(String assignedNumber) { this.assignedNumber = assignedNumber; }

    public long getAssignTime() { return assignTime; }
    public void setAssignTime(long assignTime) { this.assignTime = assignTime; }
}
