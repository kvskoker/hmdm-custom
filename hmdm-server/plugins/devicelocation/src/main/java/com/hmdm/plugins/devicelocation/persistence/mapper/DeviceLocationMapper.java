package com.hmdm.plugins.devicelocation.persistence.mapper;

import com.hmdm.plugins.devicelocation.persistence.domain.DeviceLocationSettings;
import com.hmdm.plugins.devicelocation.persistence.domain.LocationPoint;
import com.hmdm.plugins.devicelocation.persistence.domain.LostDevice;
import org.apache.ibatis.annotations.*;

import java.util.List;

public interface DeviceLocationMapper {

    // ----------------------------------------------------------------- points

    /**
     * <p>Two devices can report the same instant twice - the per-sync path and the
     * deviceinfo batch both carry the same fix - so the insert is idempotent on
     * (deviceId, ts) rather than producing a duplicate marker on the map.</p>
     */
    @Insert("INSERT INTO plugin_devicelocation_point " +
            "(deviceId, customerId, lat, lon, ts, whileLost) VALUES " +
            "(#{deviceId}, #{customerId}, #{lat}, #{lon}, #{ts}, #{whileLost}) " +
            "ON CONFLICT (deviceId, ts) DO NOTHING")
    int insertPoint(LocationPoint point);

    /**
     * <p>Trims a device's history back to the newest {@code keep} points, but never
     * discards a point recorded while the device was flagged lost - that trail is the
     * reason the flag exists.</p>
     */
    @Delete("DELETE FROM plugin_devicelocation_point WHERE deviceId = #{deviceId} " +
            "AND whileLost = FALSE AND id NOT IN (" +
            "  SELECT id FROM plugin_devicelocation_point WHERE deviceId = #{deviceId} " +
            "  ORDER BY ts DESC LIMIT #{keep})")
    int trimPoints(@Param("deviceId") int deviceId, @Param("keep") int keep);

    /** The newest point for every device that has ever reported one. */
    @Select("SELECT DISTINCT ON (p.deviceId) p.*, d.number AS deviceNumber, " +
            "(l.deviceId IS NOT NULL) AS lost " +
            "FROM plugin_devicelocation_point p " +
            "INNER JOIN devices d ON d.id = p.deviceId " +
            "LEFT JOIN plugin_devicelocation_lost l ON l.deviceId = p.deviceId " +
            "WHERE p.customerId = #{customerId} " +
            "ORDER BY p.deviceId, p.ts DESC")
    List<LocationPoint> findLatestPoints(@Param("customerId") int customerId);

    @Select("SELECT p.*, d.number AS deviceNumber, (l.deviceId IS NOT NULL) AS lost " +
            "FROM plugin_devicelocation_point p " +
            "INNER JOIN devices d ON d.id = p.deviceId " +
            "LEFT JOIN plugin_devicelocation_lost l ON l.deviceId = p.deviceId " +
            "WHERE p.deviceId = #{deviceId} ORDER BY p.ts DESC LIMIT #{limit}")
    List<LocationPoint> findPointsForDevice(@Param("deviceId") int deviceId,
                                            @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM plugin_devicelocation_point WHERE customerId = #{customerId}")
    int countPoints(@Param("customerId") int customerId);

    @Delete("DELETE FROM plugin_devicelocation_point WHERE deviceId = #{deviceId}")
    int deletePointsForDevice(@Param("deviceId") int deviceId);

    // ------------------------------------------------------------------- lost

    @Select("SELECT l.*, d.number AS deviceNumber FROM plugin_devicelocation_lost l " +
            "INNER JOIN devices d ON d.id = l.deviceId " +
            "WHERE l.customerId = #{customerId} ORDER BY l.reportedAt DESC")
    List<LostDevice> findLostDevices(@Param("customerId") int customerId);

    @Select("SELECT l.*, d.number AS deviceNumber FROM plugin_devicelocation_lost l " +
            "INNER JOIN devices d ON d.id = l.deviceId WHERE l.deviceId = #{deviceId}")
    LostDevice findLostDevice(@Param("deviceId") int deviceId);

    /** Across every customer - used by the background push task, which has no user. */
    @Select("SELECT l.*, d.number AS deviceNumber FROM plugin_devicelocation_lost l " +
            "INNER JOIN devices d ON d.id = l.deviceId ORDER BY l.reportedAt")
    List<LostDevice> findAllLostDevices();

    @Insert("INSERT INTO plugin_devicelocation_lost " +
            "(deviceId, customerId, reportedAt, reportedBy, note) VALUES " +
            "(#{deviceId}, #{customerId}, #{reportedAt}, #{reportedBy}, #{note}) " +
            "ON CONFLICT (deviceId) DO UPDATE SET note = EXCLUDED.note")
    int insertLostDevice(LostDevice lost);

    @Delete("DELETE FROM plugin_devicelocation_lost WHERE deviceId = #{deviceId}")
    int deleteLostDevice(@Param("deviceId") int deviceId);

    // --------------------------------------------------------------- settings

    @Select("SELECT * FROM plugin_devicelocation_settings WHERE customerId = #{customerId}")
    DeviceLocationSettings findSettings(@Param("customerId") int customerId);

    @Insert("INSERT INTO plugin_devicelocation_settings " +
            "(customerId, keepPoints, normalIntervalMins, lostIntervalMins, " +
            "trackAllDevices, tileUrl, tileAttribution) " +
            "VALUES (#{customerId}, #{keepPoints}, #{normalIntervalMins}, #{lostIntervalMins}, " +
            "#{trackAllDevices}, #{tileUrl}, #{tileAttribution}) " +
            "ON CONFLICT (customerId) DO UPDATE SET " +
            "keepPoints = EXCLUDED.keepPoints, " +
            "normalIntervalMins = EXCLUDED.normalIntervalMins, " +
            "lostIntervalMins = EXCLUDED.lostIntervalMins, " +
            "trackAllDevices = EXCLUDED.trackAllDevices, " +
            "tileUrl = EXCLUDED.tileUrl, tileAttribution = EXCLUDED.tileAttribution")
    int upsertSettings(DeviceLocationSettings settings);

    // --------------------------------------------------------------- devices

    @Select("SELECT customerId FROM devices WHERE id = #{deviceId}")
    Integer getDeviceCustomerId(@Param("deviceId") int deviceId);

    @Select("SELECT id FROM devices WHERE number = #{number}")
    Integer getDeviceIdByNumber(@Param("number") String number);

    @Select("SELECT number FROM devices WHERE id = #{deviceId}")
    String getDeviceNumber(@Param("deviceId") int deviceId);

    /** Devices that have never reported a position - the map cannot show these. */
    @Select("SELECT COUNT(*) FROM devices d WHERE d.customerId = #{customerId} " +
            "AND NOT EXISTS (SELECT 1 FROM plugin_devicelocation_point p WHERE p.deviceId = d.id)")
    int countDevicesWithoutLocation(@Param("customerId") int customerId);

    @Select("SELECT COUNT(*) FROM devices WHERE customerId = #{customerId}")
    int countDevices(@Param("customerId") int customerId);

    /**
     * <p>Every device, with its newest position when it has one.</p>
     *
     * <p>The map used to list only devices that had reported, which meant a device that
     * had never reported could not be found on this page at all - and reporting one lost
     * is exactly what you want to do with a device you have not heard from.</p>
     */
    @Select("SELECT d.id AS deviceId, d.number AS deviceNumber, d.customerId AS customerId, " +
            "p.lat AS lat, p.lon AS lon, COALESCE(p.ts, 0) AS ts, " +
            "COALESCE(p.whileLost, FALSE) AS whileLost, " +
            "(l.deviceId IS NOT NULL) AS lost, " +
            "c.name AS configurationName, c.requestUpdates AS requestUpdates " +
            "FROM devices d " +
            "LEFT JOIN configurations c ON c.id = d.configurationId " +
            "LEFT JOIN plugin_devicelocation_lost l ON l.deviceId = d.id " +
            "LEFT JOIN LATERAL (" +
            "  SELECT lat, lon, ts, whileLost FROM plugin_devicelocation_point " +
            "  WHERE deviceId = d.id ORDER BY ts DESC LIMIT 1) p ON TRUE " +
            "WHERE d.customerId = #{customerId} " +
            "ORDER BY (l.deviceId IS NOT NULL) DESC, p.ts DESC NULLS LAST, d.number")
    List<LocationPoint> findAllDevices(@Param("customerId") int customerId);

    /** Devices whose configuration never asks the launcher for a position. */
    @Select("SELECT COUNT(*) FROM devices d " +
            "LEFT JOIN configurations c ON c.id = d.configurationId " +
            "WHERE d.customerId = #{customerId} " +
            "AND COALESCE(c.requestUpdates, 'DONOTTRACK') = 'DONOTTRACK'")
    int countDevicesNotTracking(@Param("customerId") int customerId);

    /**
     * <p>Devices that have contacted the server in the last hour but have still never sent
     * a position.</p>
     *
     * <p>This is the diagnosis that matters. A device that is not syncing at all is an
     * ordinary connectivity problem. A device that is syncing and still sending no position
     * has a problem on the handset - the location permission was not granted, or location
     * is switched off - and no server setting will fix it.</p>
     */
    @Select("SELECT COUNT(*) FROM devices d WHERE d.customerId = #{customerId} " +
            "AND d.lastUpdate > (EXTRACT(EPOCH FROM NOW()) * 1000 - 3600000) " +
            "AND NOT EXISTS (SELECT 1 FROM plugin_devicelocation_point p WHERE p.deviceId = d.id)")
    int countSyncingWithoutLocation(@Param("customerId") int customerId);
}
