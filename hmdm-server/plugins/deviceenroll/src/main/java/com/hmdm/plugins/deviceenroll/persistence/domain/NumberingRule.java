package com.hmdm.plugins.deviceenroll.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hmdm.persistence.domain.CustomerData;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

/**
 * <p>How devices enrolling into one group get their numbers.</p>
 *
 * <p>The rule is keyed on the <em>group</em>, not the configuration. An enrollment QR code
 * carries <code>com.hmdm.GROUP</code> next to <code>com.hmdm.CONFIG</code>, so the same
 * configuration - the same applications, the same settings - can back a QR code per group.
 * That is what lets Kailahun and Kenema share one configuration and still number their
 * devices separately.</p>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class NumberingRule implements CustomerData, Serializable {

    private static final long serialVersionUID = 2L;

    @Schema(description = "Primary key")
    private Integer id;

    @Schema(description = "Group this rule applies to - one rule per group")
    private int groupId;

    @Schema(description = "Group name, for display")
    private String groupName;

    @Schema(description = "Configuration devices of this group are enrolled into")
    private int configurationId;

    @Schema(description = "Configuration name, for display")
    private String configurationName;

    @Schema(description = "Customer ID")
    private int customerId;

    @Schema(description = "Number prefix, e.g. KAI")
    private String prefix;

    @Schema(description = "How many digits to pad the sequence to, e.g. 3 gives KAI001")
    private int digits;

    @Schema(description = "The next sequence number to hand out")
    private int nextSeq;

    @Schema(description = "Whether the rule is active")
    private boolean enabled;

    @Schema(description = "The configuration's QR key - combined with the group id it makes this rule's QR code")
    private String qrCodeKey;

    /**
     * The configuration's main application. A configuration without one cannot produce an
     * enrollment QR code at all - the QR has to tell a factory-reset device which APK to
     * install as its device owner.
     */
    @Schema(description = "Main application of the configuration, null if not set")
    private Integer mainAppId;

    public NumberingRule() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public int getGroupId() { return groupId; }
    public void setGroupId(int groupId) { this.groupId = groupId; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public int getConfigurationId() { return configurationId; }
    public void setConfigurationId(int configurationId) { this.configurationId = configurationId; }

    public String getConfigurationName() { return configurationName; }
    public void setConfigurationName(String configurationName) {
        this.configurationName = configurationName;
    }

    @Override
    public int getCustomerId() { return customerId; }

    @Override
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }

    public int getDigits() { return digits; }
    public void setDigits(int digits) { this.digits = digits; }

    public int getNextSeq() { return nextSeq; }
    public void setNextSeq(int nextSeq) { this.nextSeq = nextSeq; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getQrCodeKey() { return qrCodeKey; }
    public void setQrCodeKey(String qrCodeKey) { this.qrCodeKey = qrCodeKey; }

    public Integer getMainAppId() { return mainAppId; }
    public void setMainAppId(Integer mainAppId) { this.mainAppId = mainAppId; }

    @Override
    public String toString() {
        return "NumberingRule{id=" + id + ", groupId=" + groupId
                + ", configurationId=" + configurationId + ", prefix='" + prefix + '\''
                + ", digits=" + digits + ", nextSeq=" + nextSeq + ", enabled=" + enabled + '}';
    }
}
