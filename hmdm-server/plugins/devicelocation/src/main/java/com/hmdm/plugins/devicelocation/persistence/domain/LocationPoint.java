package com.hmdm.plugins.devicelocation.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/** One position report from one device. */
@JsonIgnoreProperties(ignoreUnknown = true)
public class LocationPoint implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Primary key")
    private Integer id;

    @Schema(description = "Device this point belongs to")
    private int deviceId;

    @Schema(description = "Device number, for display")
    private String deviceNumber;

    @Schema(description = "Customer ID")
    private int customerId;

    @Schema(description = "Latitude")
    private Double lat;

    @Schema(description = "Longitude")
    private Double lon;

    @Schema(description = "When the device recorded the position, ms since epoch")
    private long ts;

    @Schema(description = "Whether the device was flagged lost when this point arrived")
    private boolean whileLost;

    @Schema(description = "Whether the device is flagged lost right now, for display")
    private boolean lost;

    @Schema(description = "Configuration the device is on, for display")
    private String configurationName;

    /**
     * The configuration's location tracking mode - DONOTTRACK, GPS or WIFI. Carried so the
     * page can say why a particular device has never reported, instead of leaving a blank
     * row that looks like a bug.
     */
    @Schema(description = "Location tracking mode of the device's configuration")
    private String requestUpdates;

    public LocationPoint() {
    }

    @Override
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public int getDeviceId() { return deviceId; }
    public void setDeviceId(int deviceId) { this.deviceId = deviceId; }

    public String getDeviceNumber() { return deviceNumber; }
    public void setDeviceNumber(String deviceNumber) { this.deviceNumber = deviceNumber; }

    @Override
    public int getCustomerId() { return customerId; }

    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLon() { return lon; }
    public void setLon(Double lon) { this.lon = lon; }

    public long getTs() { return ts; }
    public void setTs(long ts) { this.ts = ts; }

    public boolean isWhileLost() { return whileLost; }
    public void setWhileLost(boolean whileLost) { this.whileLost = whileLost; }

    public boolean isLost() { return lost; }
    public void setLost(boolean lost) { this.lost = lost; }

    public String getConfigurationName() { return configurationName; }
    public void setConfigurationName(String configurationName) {
        this.configurationName = configurationName;
    }

    public String getRequestUpdates() { return requestUpdates; }
    public void setRequestUpdates(String requestUpdates) {
        this.requestUpdates = requestUpdates;
    }

    /** True when this row is a device we have never had a position from. */
    public boolean isHasPosition() { return lat != null && lon != null; }

    @Override
    public String toString() {
        return "LocationPoint{deviceId=" + deviceId + ", lat=" + lat + ", lon=" + lon
                + ", ts=" + ts + ", whileLost=" + whileLost + '}';
    }
}
