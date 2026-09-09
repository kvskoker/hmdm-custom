package com.hmdm.plugins.devicereset.persistence.mapper;

import com.hmdm.plugins.devicereset.persistence.domain.DeviceLock;
import org.apache.ibatis.annotations.*;

import java.util.List;

public interface DeviceLockMapper {

    @Insert("INSERT INTO plugin_devicereset_lock " +
            "(deviceId, customerId, locked, lockMessage, requestedBy, updateTime) " +
            "VALUES " +
            "(#{deviceId}, #{customerId}, #{locked}, #{lockMessage}, #{requestedBy}, #{updateTime}) " +
            "ON CONFLICT (deviceId) DO UPDATE SET " +
            "locked = EXCLUDED.locked, lockMessage = EXCLUDED.lockMessage, " +
            "requestedBy = EXCLUDED.requestedBy, updateTime = EXCLUDED.updateTime")
    int upsert(DeviceLock record);

    @Select("SELECT * FROM plugin_devicereset_lock WHERE deviceId = #{deviceId}")
    DeviceLock findByDevice(@Param("deviceId") int deviceId);

    @Select("SELECT l.*, d.number AS deviceNumber " +
            "FROM plugin_devicereset_lock l " +
            "INNER JOIN devices d ON d.id = l.deviceId " +
            "WHERE l.customerId = #{customerId} AND l.locked IS TRUE " +
            "ORDER BY l.updateTime DESC")
    List<DeviceLock> findLocked(@Param("customerId") int customerId);
}
