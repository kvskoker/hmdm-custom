package com.hmdm.plugins.devicereset.persistence.sql;

import java.util.Map;

/** Shared predicates keep history counts and pages within the same access scope. */
public final class HistorySql {
    private static String table(String kind) {
        return switch (kind) {
            case "password" -> "plugin_devicereset_password";
            case "commands" -> "plugin_devicereset_command";
            case "locked" -> "plugin_devicereset_lock";
            default -> throw new IllegalArgumentException("Invalid history kind");
        };
    }

    private static String from(Map<String, Object> args) {
        String kind = (String) args.get("kind");
        boolean locked = "locked".equals(kind);
        String sql = " FROM " + table(kind) + " r JOIN devices d ON d.id = r.deviceId"
                + " JOIN users u ON u.id = #{userId}"
                + " WHERE r.customerId = #{customerId} AND d.customerId = #{customerId}"
                + " AND (u.allDevicesAvailable = TRUE OR EXISTS (SELECT 1 FROM deviceGroups dg"
                + " JOIN userDeviceGroupsAccess a ON a.groupId = dg.groupId"
                + " WHERE dg.deviceId = d.id AND a.userId = u.id))"
                + " AND (d.number ILIKE #{search} OR d.imei ILIKE #{search}"
                + " OR d.infojson ->> 'imei' ILIKE #{search} OR d.infojson ->> 'serial' ILIKE #{search}"
                + " OR r.requestedBy ILIKE #{search}"
                + (locked ? " OR r.lockMessage ILIKE #{search}" : "") + ")"
                + " AND r." + (locked ? "updateTime" : "requestTime") + " >= #{after}";
        if (locked) sql += " AND r.locked = TRUE";
        else if (args.get("status") != null) sql += " AND r.status = #{status}";
        if ("commands".equals(kind) && args.get("commandType") != null) sql += " AND r.commandType = #{commandType}";
        return sql;
    }

    public static String count(Map<String, Object> args) {
        return "SELECT COUNT(*)" + from(args);
    }

    public static String page(Map<String, Object> args) {
        String kind = (String) args.get("kind");
        boolean locked = "locked".equals(kind);
        // Never retrieve stored PINs for history responses.
        String columns = "d.number AS \"deviceNumber\", r.deviceId AS \"deviceId\", r.requestedBy AS \"requestedBy\", ";
        columns += locked
                ? "r.deviceId AS id, r.updateTime AS \"requestTime\", r.lockMessage AS \"lockMessage\""
                : "r.id, r.requestTime AS \"requestTime\", r.status";
        if ("commands".equals(kind)) columns += ", r.commandType AS \"commandType\", r.deviceCapable AS \"deviceCapable\"";
        return "SELECT " + columns + from(args)
                + " ORDER BY r." + (locked ? "updateTime DESC, r.deviceId" : "id")
                + " DESC LIMIT #{pageSize} OFFSET #{offset}";
    }
}
