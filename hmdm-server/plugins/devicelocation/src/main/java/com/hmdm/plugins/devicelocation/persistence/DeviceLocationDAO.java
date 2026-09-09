package com.hmdm.plugins.devicelocation.persistence;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.plugins.devicelocation.persistence.domain.DeviceLocationSettings;
import com.hmdm.plugins.devicelocation.persistence.domain.LocationPoint;
import com.hmdm.plugins.devicelocation.persistence.domain.LostDevice;
import com.hmdm.plugins.devicelocation.persistence.mapper.DeviceLocationMapper;
import com.hmdm.security.SecurityContext;
import com.hmdm.rest.json.DeviceLocation;
import org.mybatis.guice.transactional.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Singleton
public class DeviceLocationDAO {

    private static final Logger log = LoggerFactory.getLogger(DeviceLocationDAO.class);

    /** Guards the per-device history view against a lost device with a very long trail. */
    private static final int MAX_TRAIL_POINTS = 500;

    private final DeviceLocationMapper mapper;

    @Inject
    public DeviceLocationDAO(DeviceLocationMapper mapper) {
        this.mapper = mapper;
    }

    // ----------------------------------------------------------------- points

    /**
     * <p>Records positions reported by a device and trims its history back to the
     * configured size.</p>
     *
     * <p>Called from the event listener, which runs on a background thread with no user in
     * scope, so the customer is taken from the device rather than from a security context.</p>
     */
    @Transactional
    public void recordLocations(int deviceId, List<DeviceLocation> locations) {
        if (locations == null || locations.isEmpty()) {
            return;
        }
        Integer customerId = this.mapper.getDeviceCustomerId(deviceId);
        if (customerId == null) {
            log.warn("Ignoring {} location(s) for unknown device id {}", locations.size(), deviceId);
            return;
        }

        boolean lost = this.mapper.findLostDevice(deviceId) != null;
        int stored = 0;
        for (DeviceLocation location : locations) {
            if (location == null || location.getLat() == null || location.getLon() == null) {
                continue;
            }
            LocationPoint point = new LocationPoint();
            point.setDeviceId(deviceId);
            point.setCustomerId(customerId);
            point.setLat(location.getLat());
            point.setLon(location.getLon());
            // A device without a clock set can report ts=0; server time is a better guess
            // than putting the point at the epoch and sorting it to the bottom forever.
            point.setTs(location.getTs() == null || location.getTs() <= 0
                    ? System.currentTimeMillis() : location.getTs());
            point.setWhileLost(lost);
            stored += this.mapper.insertPoint(point);
        }

        if (stored > 0 && !lost) {
            DeviceLocationSettings settings = settingsFor(customerId);
            this.mapper.trimPoints(deviceId, Math.max(1, settings.getKeepPoints()));
        }

        if (stored > 0) {
            log.debug("Recorded {} location point(s) for device id {}{}",
                      stored, deviceId, lost ? " (reported lost)" : "");
        }
    }

    /** Every device, whether or not it has ever reported a position. */
    public List<LocationPoint> allDevices() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.mapper.findAllDevices(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    public List<LocationPoint> latestPoints() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.mapper.findLatestPoints(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    public List<LocationPoint> pointsForDevice(int deviceId, int limit) {
        return this.mapper.findPointsForDevice(deviceId,
                Math.min(limit <= 0 ? MAX_TRAIL_POINTS : limit, MAX_TRAIL_POINTS));
    }

    // ------------------------------------------------------------------- lost

    public List<LostDevice> lostDevices() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.mapper.findLostDevices(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    /** Every lost device across all customers - the push task runs without a user. */
    public List<LostDevice> allLostDevices() {
        return this.mapper.findAllLostDevices();
    }

    public boolean isLost(int deviceId) {
        return this.mapper.findLostDevice(deviceId) != null;
    }

    public LostDevice findLost(int deviceId) {
        return this.mapper.findLostDevice(deviceId);
    }

    public Integer deviceIdByNumber(String number) {
        return this.mapper.getDeviceIdByNumber(number);
    }

    /** The device's customer, for the code paths that run without a user in scope. */
    public Integer customerIdOf(int deviceId) {
        return this.mapper.getDeviceCustomerId(deviceId);
    }

    public String deviceNumber(int deviceId) {
        return this.mapper.getDeviceNumber(deviceId);
    }

    @Transactional
    public LostDevice reportLost(int deviceId, String note) {
        return SecurityContext.get().getCurrentUser().map(user -> {
            LostDevice lost = new LostDevice();
            lost.setDeviceId(deviceId);
            lost.setCustomerId(user.getCustomerId());
            lost.setReportedAt(System.currentTimeMillis());
            lost.setReportedBy(user.getLogin());
            lost.setNote(note);
            this.mapper.insertLostDevice(lost);
            log.info("Device id {} ('{}') reported lost by {}",
                     deviceId, this.mapper.getDeviceNumber(deviceId), user.getLogin());
            return this.mapper.findLostDevice(deviceId);
        }).orElse(null);
    }

    /**
     * <p>Clears the lost flag. The trail recorded while the device was missing is kept -
     * deleting the evidence at the moment the device is recovered is rarely what anyone
     * wants, and the map offers an explicit way to clear a device's history.</p>
     */
    public void reportFound(int deviceId) {
        this.mapper.deleteLostDevice(deviceId);
        log.info("Device id {} ('{}') no longer reported lost",
                 deviceId, this.mapper.getDeviceNumber(deviceId));
    }

    public void clearHistory(int deviceId) {
        int removed = this.mapper.deletePointsForDevice(deviceId);
        log.info("Cleared {} location point(s) for device id {}", removed, deviceId);
    }

    // --------------------------------------------------------------- settings

    public DeviceLocationSettings settings() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> settingsFor(user.getCustomerId()))
                .orElseGet(DeviceLocationSettings::new);
    }

    /**
     * <p>Settings for a customer, falling back to the defaults rather than null.</p>
     *
     * <p>A customer created before this plugin was installed has no settings row, and the
     * plugin has to work for them without an administrator visiting the settings page
     * first.</p>
     */
    public DeviceLocationSettings settingsFor(int customerId) {
        DeviceLocationSettings settings = this.mapper.findSettings(customerId);
        if (settings == null) {
            settings = new DeviceLocationSettings();
            settings.setCustomerId(customerId);
            settings.setTileUrl("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
            settings.setTileAttribution("© OpenStreetMap contributors");
        }
        return settings;
    }

    public void saveSettings(DeviceLocationSettings settings) {
        SecurityContext.get().getCurrentUser().ifPresent(user -> {
            settings.setCustomerId(user.getCustomerId());
            if (settings.getKeepPoints() < 1) {
                settings.setKeepPoints(1);
            }
            if (settings.getNormalIntervalMins() < 1) {
                settings.setNormalIntervalMins(DeviceLocationSettings.DEFAULT_NORMAL_INTERVAL_MINS);
            }
            if (settings.getLostIntervalMins() < 1) {
                settings.setLostIntervalMins(DeviceLocationSettings.DEFAULT_LOST_INTERVAL_MINS);
            }
            this.mapper.upsertSettings(settings);
        });
    }

    // ----------------------------------------------------------------- health

    /**
     * <p>How many devices have never reported a position.</p>
     *
     * <p>Worth showing on the page: an empty map has two very different causes - nothing is
     * lost, or nothing is reporting - and the difference is not otherwise visible.</p>
     */
    public int[] coverage() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> new int[]{
                        this.mapper.countDevices(user.getCustomerId()),
                        this.mapper.countDevicesWithoutLocation(user.getCustomerId())})
                .orElse(new int[]{0, 0});
    }

    /**
     * <p>Why positions might not be arriving.</p>
     *
     * <p>The launcher attaches its last known position to the device info it posts on every
     * sync, but it only has one if the server told it to collect one - and that setting
     * defaults to off and does not announce itself. Separately, a device can be syncing
     * happily and still send nothing, because the handset refused the location permission.
     * Those two causes need different fixes, so the page distinguishes them.</p>
     */
    public Map<String, Object> diagnostics() {
        Map<String, Object> result = new HashMap<>();
        SecurityContext.get().getCurrentUser().ifPresent(user -> {
            int customerId = user.getCustomerId();
            result.put("devicesNotTracking", this.mapper.countDevicesNotTracking(customerId));
            result.put("syncingWithoutLocation", this.mapper.countSyncingWithoutLocation(customerId));
            result.put("trackAllDevices", settingsFor(customerId).isTrackAllDevices());
        });
        return result;
    }
}
