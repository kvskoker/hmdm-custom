package com.hmdm.persistence.mapper;

import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Map;

public interface DeviceRegisterMapper {
    @Select("SELECT fields, inactiveDays AS days FROM deviceRegisterSettings WHERE customerId=#{customer}")
    Map<String, Object> settings(@Param("customer") int customer);

    @Insert("INSERT INTO deviceRegisterSettings(customerId, fields, inactiveDays) VALUES(#{customer}, #{fields}, #{days}) " +
            "ON CONFLICT(customerId) DO UPDATE SET fields=EXCLUDED.fields, inactiveDays=EXCLUDED.inactiveDays")
    void settingsSave(@Param("customer") int customer, @Param("fields") String fields, @Param("days") int days);

    @Select("<script>SELECT deviceId AS id, data::text AS data FROM deviceRegisterValues WHERE deviceId IN " +
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach></script>")
    List<Map<String, Object>> values(@Param("ids") List<Integer> ids);

    @Select("SELECT DISTINCT d.id FROM devices d JOIN users u ON u.id=#{user} " +
            "WHERE d.customerId=#{customer} AND d.number=#{number} AND " +
            "(u.allDevicesAvailable OR EXISTS (SELECT 1 FROM deviceGroups g " +
            "JOIN userDeviceGroupsAccess a ON a.groupId=g.groupId WHERE g.deviceId=d.id AND a.userId=u.id))")
    Integer accessibleId(@Param("customer") int customer, @Param("user") int user, @Param("number") String number);

    // All rows update atomically. Recheck tenant/group access in the write itself.
    @Insert("INSERT INTO deviceRegisterValues(deviceId,data,updatedBy) " +
            "SELECT d.id, r->'values', #{user} FROM jsonb_array_elements(CAST(#{rows} AS jsonb)) r " +
            "JOIN devices d ON d.number=r->>'number' JOIN users u ON u.id=#{user} " +
            "WHERE d.customerId=#{customer} AND (u.allDevicesAvailable OR EXISTS " +
            "(SELECT 1 FROM deviceGroups g JOIN userDeviceGroupsAccess a ON a.groupId=g.groupId " +
            "WHERE g.deviceId=d.id AND a.userId=u.id)) " +
            "ON CONFLICT(deviceId) DO UPDATE SET data=deviceRegisterValues.data || EXCLUDED.data, " +
            "updatedBy=EXCLUDED.updatedBy, updatedAt=NOW()")
    int save(@Param("customer") int customer, @Param("user") int user, @Param("rows") String rows);
}
