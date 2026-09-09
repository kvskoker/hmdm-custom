package com.hmdm.plugins.devicereset.persistence.mapper;

import com.hmdm.plugins.devicereset.persistence.domain.DeviceCommand;
import org.apache.ibatis.annotations.*;

import java.util.List;

public interface DeviceCommandMapper {

    @Insert("INSERT INTO plugin_devicereset_command " +
            "(customerId, deviceId, commandType, requestedBy, requestTime, status) " +
            "VALUES " +
            "(#{customerId}, #{deviceId}, #{commandType}, #{requestedBy}, #{requestTime}, #{status})")
    @SelectKey(statement = "SELECT currval('plugin_devicereset_command_id_seq')",
            keyColumn = "id", keyProperty = "id", before = false, resultType = int.class)
    int insert(DeviceCommand record);

    @Select("SELECT c.*, d.number AS deviceNumber " +
            "FROM plugin_devicereset_command c " +
            "INNER JOIN devices d ON d.id = c.deviceId " +
            "WHERE c.deviceId = #{deviceId} AND c.commandType = #{commandType} AND c.status < 2 " +
            "ORDER BY c.id DESC LIMIT 1")
    DeviceCommand findPending(@Param("deviceId") int deviceId,
                              @Param("commandType") String commandType);

    @Update("UPDATE plugin_devicereset_command " +
            "SET status = 1, deliverTime = #{ts} WHERE id = #{id} AND status = 0")
    int markDelivered(@Param("id") int id, @Param("ts") long ts);

    @Update("UPDATE plugin_devicereset_command SET status = 2, confirmTime = #{ts} " +
            "WHERE deviceId = #{deviceId} AND commandType = #{commandType} AND status < 2")
    int markConfirmed(@Param("deviceId") int deviceId,
                      @Param("commandType") String commandType,
                      @Param("ts") long ts);

    @Update("UPDATE plugin_devicereset_command " +
            "SET status = 2, confirmTime = #{ts}, deviceCapable = #{capable} " +
            "WHERE deviceId = #{deviceId} AND commandType = #{commandType} AND status < 2")
    int markConfirmedWithCapability(@Param("deviceId") int deviceId,
                                    @Param("commandType") String commandType,
                                    @Param("ts") long ts,
                                    @Param("capable") Boolean capable);

    @Select("SELECT c.*, d.number AS deviceNumber " +
            "FROM plugin_devicereset_command c " +
            "INNER JOIN devices d ON d.id = c.deviceId " +
            "WHERE c.customerId = #{customerId} ORDER BY c.id DESC LIMIT 200")
    List<DeviceCommand> findAllByCustomer(@Param("customerId") int customerId);
}
