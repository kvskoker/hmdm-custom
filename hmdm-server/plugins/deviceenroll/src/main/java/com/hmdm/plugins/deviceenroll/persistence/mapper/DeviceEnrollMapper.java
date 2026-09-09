package com.hmdm.plugins.deviceenroll.persistence.mapper;

import com.hmdm.plugins.deviceenroll.persistence.domain.NumberAssignment;
import com.hmdm.plugins.deviceenroll.persistence.domain.NumberingRule;
import org.apache.ibatis.annotations.*;

import java.util.List;

public interface DeviceEnrollMapper {

    // ------------------------------------------------------------------ rules

    String RULE_COLUMNS =
            "SELECT r.*, g.name AS groupName, c.name AS configurationName, " +
            "c.qrCodeKey AS qrCodeKey, c.mainAppId AS mainAppId " +
            "FROM plugin_deviceenroll_rule r " +
            "INNER JOIN groups g ON g.id = r.groupId " +
            "INNER JOIN configurations c ON c.id = r.configurationId ";

    @Select(RULE_COLUMNS + "WHERE r.customerId = #{customerId} ORDER BY g.name")
    List<NumberingRule> findRules(@Param("customerId") int customerId);

    @Select(RULE_COLUMNS + "WHERE r.id = #{id}")
    NumberingRule findRuleById(@Param("id") int id);

    @Select(RULE_COLUMNS + "WHERE r.groupId = #{groupId}")
    NumberingRule findRuleByGroup(@Param("groupId") int groupId);

    /**
     * <p>The rule that applies to a device, found through the groups it belongs to.</p>
     *
     * <p>The device joined its group at enrolment: the QR code carried the group id, and the
     * core created the membership before this plugin ever sees the device. A device in two
     * ruled groups is ambiguous, so the oldest rule wins and that choice stays stable.</p>
     */
    @Select("SELECT r.*, g.name AS groupName, c.name AS configurationName, " +
            "c.qrCodeKey AS qrCodeKey, c.mainAppId AS mainAppId " +
            "FROM plugin_deviceenroll_rule r " +
            "INNER JOIN groups g ON g.id = r.groupId " +
            "INNER JOIN configurations c ON c.id = r.configurationId " +
            "INNER JOIN deviceGroups dg ON dg.groupId = r.groupId " +
            "WHERE dg.deviceId = #{deviceId} AND r.enabled = TRUE " +
            "ORDER BY r.id LIMIT 1")
    NumberingRule findRuleForDevice(@Param("deviceId") int deviceId);

    @Insert("INSERT INTO plugin_deviceenroll_rule " +
            "(groupId, configurationId, customerId, prefix, digits, nextSeq, enabled) VALUES " +
            "(#{groupId}, #{configurationId}, #{customerId}, #{prefix}, #{digits}, " +
            "#{nextSeq}, #{enabled}) " +
            "ON CONFLICT (groupId) DO UPDATE SET " +
            "configurationId = EXCLUDED.configurationId, prefix = EXCLUDED.prefix, " +
            "digits = EXCLUDED.digits, enabled = EXCLUDED.enabled")
    int upsertRule(NumberingRule rule);

    @Update("UPDATE plugin_deviceenroll_rule SET nextSeq = #{nextSeq} WHERE id = #{id}")
    int updateNextSeq(@Param("id") int id, @Param("nextSeq") int nextSeq);

    @Delete("DELETE FROM plugin_deviceenroll_rule WHERE id = #{id}")
    int deleteRule(@Param("id") int id);

    /**
     * Allocates the next sequence atomically. The UPDATE ... RETURNING keeps two devices
     * enrolling at the same moment from being handed the same number.
     */
    @Select("UPDATE plugin_deviceenroll_rule SET nextSeq = nextSeq + 1 " +
            "WHERE id = #{id} RETURNING nextSeq - 1")
    Integer allocateSequence(@Param("id") int id);

    // ------------------------------------------------------------ assignments

    @Select("SELECT * FROM plugin_deviceenroll_assigned WHERE deviceId = #{deviceId}")
    NumberAssignment findAssignment(@Param("deviceId") int deviceId);

    @Insert("INSERT INTO plugin_deviceenroll_assigned " +
            "(deviceId, customerId, originalNumber, assignedNumber, assignTime) VALUES " +
            "(#{deviceId}, #{customerId}, #{originalNumber}, #{assignedNumber}, #{assignTime}) " +
            "ON CONFLICT (deviceId) DO NOTHING")
    int insertAssignment(NumberAssignment assignment);

    @Select("SELECT * FROM plugin_deviceenroll_assigned WHERE customerId = #{customerId} " +
            "ORDER BY assignTime DESC LIMIT 200")
    List<NumberAssignment> findAssignments(@Param("customerId") int customerId);

    // ---------------------------------------------------------------- devices

    @Select("SELECT number FROM devices WHERE id = #{deviceId}")
    String getDeviceNumber(@Param("deviceId") int deviceId);

    @Select("SELECT customerId FROM devices WHERE id = #{deviceId}")
    Integer getDeviceCustomerId(@Param("deviceId") int deviceId);

    /** First contact with the server. Set by the core on the device's first sync. */
    @Select("SELECT enrollTime FROM devices WHERE id = #{deviceId}")
    Long getDeviceEnrollTime(@Param("deviceId") int deviceId);

    @Select("SELECT COUNT(*) FROM devices WHERE number = #{number}")
    int countByNumber(@Param("number") String number);

    /** Keeps the previous number in oldNumber, which the core sync path already understands. */
    @Update("UPDATE devices SET oldNumber = number, number = #{newNumber} WHERE id = #{deviceId}")
    int renameDevice(@Param("deviceId") int deviceId, @Param("newNumber") String newNumber);

    // ----------------------------------------------------------------- groups

    @Select("SELECT id FROM groups WHERE customerId = #{customerId} AND name = #{name}")
    Integer findGroupIdByName(@Param("customerId") int customerId, @Param("name") String name);
}
