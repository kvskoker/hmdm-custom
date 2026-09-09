package com.hmdm.plugins.devicelocation.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.annotations.ApiModelProperty;

import java.io.Serializable;

/**
 * <p>A device someone has reported lost or missing.</p>
 *
 * <p>The flag is the switch for everything else: while it is set, the device is asked to
 * report its position every couple of minutes instead of a few times a day, location
 * collection is forced on even if the configuration has it turned off, and its points stop
 * being trimmed so the trail survives.</p>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class LostDevice implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty("Device that is missing - also the primary key")
    private int deviceId;

    @ApiModelProperty("Device number, for display")
    private String deviceNumber;

    @ApiModelProperty("Customer ID")
    private int customerId;

    @ApiModelProperty("When it was reported, ms since epoch")
    private long reportedAt;

    @ApiModelProperty("Login of the user who reported it")
    private String reportedBy;

    @ApiModelProperty("Free text - where it was last seen, who had it")
    private String note;

    public LostDevice() {
    }

    @Override
    public Integer getId() { return deviceId; }

    public int getDeviceId() { return deviceId; }
    public void setDeviceId(int deviceId) { this.deviceId = deviceId; }

    public String getDeviceNumber() { return deviceNumber; }
    public void setDeviceNumber(String deviceNumber) { this.deviceNumber = deviceNumber; }

    @Override
    public int getCustomerId() { return customerId; }

    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public long getReportedAt() { return reportedAt; }
    public void setReportedAt(long reportedAt) { this.reportedAt = reportedAt; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    @Override
    public String toString() {
        return "LostDevice{deviceId=" + deviceId + ", reportedAt=" + reportedAt
                + ", reportedBy='" + reportedBy + "'}";
    }
}
