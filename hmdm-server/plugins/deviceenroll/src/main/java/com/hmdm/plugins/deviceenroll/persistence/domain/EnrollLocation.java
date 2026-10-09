package com.hmdm.plugins.deviceenroll.persistence.domain;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/**
 * <p>A request to create an enrollment location.</p>
 *
 * <p>Headwind ties a QR code to a configuration: the code a device scans is
 * <code>/rest/public/qr/{configuration.qrCodeKey}</code>. So "one QR per location" can only
 * mean "one configuration per location", and a numbering rule hangs off that configuration.
 * Rather than making an administrator build those three things by hand and then wonder why
 * a second rule collides with the first, this request creates all of them in one step.</p>
 */
@Schema(description = "A location to enrol devices into")
public class EnrollLocation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Location name - becomes the name of the configuration, e.g. Kailahun")
    private String name;

    @Schema(description = "Device number prefix, e.g. KAI")
    private String prefix;

    @Schema(description = "How many digits follow the prefix")
    private int digits = 3;

    @Schema(description = "Existing group to add enrolled devices to, or null to use groupName")
    private Integer groupId;

    @Schema(description = "Name of a group to create (or reuse) when groupId is not given")
    private String groupName;

    @Schema(description = "Configuration this location's configuration is copied from")
    private int templateConfigurationId;

    public EnrollLocation() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }

    public int getDigits() { return digits; }
    public void setDigits(int digits) { this.digits = digits; }

    public Integer getGroupId() { return groupId; }
    public void setGroupId(Integer groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public int getTemplateConfigurationId() { return templateConfigurationId; }
    public void setTemplateConfigurationId(int templateConfigurationId) {
        this.templateConfigurationId = templateConfigurationId;
    }

    @Override
    public String toString() {
        return "EnrollLocation{name='" + name + "', prefix='" + prefix + "', digits=" + digits
                + ", groupId=" + groupId + ", groupName='" + groupName + "'"
                + ", templateConfigurationId=" + templateConfigurationId + '}';
    }
}
