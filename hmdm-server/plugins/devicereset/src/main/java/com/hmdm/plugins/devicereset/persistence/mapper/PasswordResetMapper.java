package com.hmdm.plugins.devicereset.persistence.mapper;

import com.hmdm.plugins.devicereset.persistence.domain.PasswordReset;
import org.apache.ibatis.annotations.*;

import java.util.List;

public interface PasswordResetMapper {

    @Insert("INSERT INTO plugin_devicereset_password " +
            "(customerId, deviceId, newPassword, requestedBy, requestTime, status) " +
            "VALUES " +
            "(#{customerId}, #{deviceId}, #{newPassword}, #{requestedBy}, #{requestTime}, #{status})")
    @SelectKey(statement = "SELECT currval('plugin_devicereset_password_id_seq')",
            keyColumn = "id", keyProperty = "id", before = false, resultType = int.class)
    int insert(PasswordReset record);

    /**
     * The outstanding request for a device, if any. Delivered rows stay eligible so
     * a device that syncs again before confirming still receives the PIN.
     */
    @Select("SELECT p.*, d.number AS deviceNumber " +
            "FROM plugin_devicereset_password p " +
            "INNER JOIN devices d ON d.id = p.deviceId " +
            "WHERE p.deviceId = #{deviceId} AND p.status < 2 " +
            "ORDER BY p.id DESC LIMIT 1")
    PasswordReset findPendingByDevice(@Param("deviceId") int deviceId);

    @Update("UPDATE plugin_devicereset_password " +
            "SET status = 1, deliverTime = #{ts} WHERE id = #{id} AND status = 0")
    int markDelivered(@Param("id") int id, @Param("ts") long ts);

    @Update("UPDATE plugin_devicereset_password " +
            "SET status = 2, confirmTime = #{ts} WHERE deviceId = #{deviceId} AND status < 2")
    int markConfirmed(@Param("deviceId") int deviceId, @Param("ts") long ts);

    /** Supersede any outstanding request so a device only ever has one in flight. */
    @Update("UPDATE plugin_devicereset_password " +
            "SET status = 2, confirmTime = #{ts} WHERE deviceId = #{deviceId} AND status < 2")
    int cancelOutstanding(@Param("deviceId") int deviceId, @Param("ts") long ts);

    @Select("SELECT p.*, d.number AS deviceNumber " +
            "FROM plugin_devicereset_password p " +
            "INNER JOIN devices d ON d.id = p.deviceId " +
            "WHERE p.customerId = #{customerId} " +
            "ORDER BY p.id DESC LIMIT 200")
    List<PasswordReset> findAllByCustomer(@Param("customerId") int customerId);
}
