package com.hmdm.plugins.devicelocation.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/** Per-customer tracking settings. */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeviceLocationSettings implements CustomerData, Serializable {

    private static final long serialVersionUID = 1L;

    public static final int DEFAULT_KEEP_POINTS = 5;
    public static final int DEFAULT_NORMAL_INTERVAL_MINS = 360;
    public static final int DEFAULT_LOST_INTERVAL_MINS = 2;

    @Schema(description = "Primary key")
    private Integer id;

    @Schema(description = "Customer ID")
    private int customerId;

    @Schema(description = "How many positions to keep per device in normal operation")
    private int keepPoints = DEFAULT_KEEP_POINTS;

    @Schema(description = "How often a device reports its position normally, in minutes")
    private int normalIntervalMins = DEFAULT_NORMAL_INTERVAL_MINS;

    @Schema(description = "How often a device reported lost should report, in minutes")
    private int lostIntervalMins = DEFAULT_LOST_INTERVAL_MINS;

    @Schema(description = "Ask every device for its position, whatever its configuration says")
    private boolean trackAllDevices = true;

    @Schema(description = "Map tile URL template")
    private String tileUrl;

    @Schema(description = "Attribution text the tile provider requires")
    private String tileAttribution;

    public DeviceLocationSettings() {
    }

    @Override
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    @Override
    public int getCustomerId() { return customerId; }

    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public int getKeepPoints() { return keepPoints; }
    public void setKeepPoints(int keepPoints) { this.keepPoints = keepPoints; }

    public int getNormalIntervalMins() { return normalIntervalMins; }
    public void setNormalIntervalMins(int normalIntervalMins) {
        this.normalIntervalMins = normalIntervalMins;
    }

    public int getLostIntervalMins() { return lostIntervalMins; }
    public void setLostIntervalMins(int lostIntervalMins) {
        this.lostIntervalMins = lostIntervalMins;
    }

    public boolean isTrackAllDevices() { return trackAllDevices; }
    public void setTrackAllDevices(boolean trackAllDevices) {
        this.trackAllDevices = trackAllDevices;
    }

    public String getTileUrl() { return tileUrl; }
    public void setTileUrl(String tileUrl) { this.tileUrl = tileUrl; }

    public String getTileAttribution() { return tileAttribution; }
    public void setTileAttribution(String tileAttribution) {
        this.tileAttribution = tileAttribution;
    }

    @Override
    public String toString() {
        return "DeviceLocationSettings{customerId=" + customerId + ", keepPoints=" + keepPoints
                + ", normalIntervalMins=" + normalIntervalMins
                + ", lostIntervalMins=" + lostIntervalMins + '}';
    }
}
