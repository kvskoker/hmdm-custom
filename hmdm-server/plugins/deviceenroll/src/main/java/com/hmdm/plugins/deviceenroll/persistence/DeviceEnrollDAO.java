package com.hmdm.plugins.deviceenroll.persistence;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.persistence.GroupDAO;
import com.hmdm.persistence.domain.Group;
import com.hmdm.plugins.deviceenroll.persistence.domain.NumberAssignment;
import com.hmdm.plugins.deviceenroll.persistence.domain.NumberingRule;
import com.hmdm.plugins.deviceenroll.persistence.mapper.DeviceEnrollMapper;
import com.hmdm.security.SecurityContext;
import org.mybatis.guice.transactional.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;

@Singleton
public class DeviceEnrollDAO {

    private static final Logger log = LoggerFactory.getLogger(DeviceEnrollDAO.class);

    /**
     * <p>How recently a device must have enrolled for automatic numbering to apply.</p>
     *
     * <p>Rules are found through group membership, and an administrator can add an existing
     * device to a group at any time. Without this window, dragging ComEMR-PSI-001 into the
     * Kailahun group would silently rename it to KAI007 on its next sync. A device that
     * enrolled from the group's QR code reaches its first sync within seconds, so a day is
     * generous for the case we want and closed for the case we do not.</p>
     */
    private static final long ENROLLMENT_WINDOW_MS = 24L * 60 * 60 * 1000;

    private final DeviceEnrollMapper mapper;
    private final GroupDAO groupDAO;

    @Inject
    public DeviceEnrollDAO(DeviceEnrollMapper mapper, GroupDAO groupDAO) {
        this.mapper = mapper;
        this.groupDAO = groupDAO;
    }

    /** Thrown when a rule cannot be saved; the message is a localization key. */
    public static class RuleException extends RuntimeException {
        public RuleException(String messageKey) {
            super(messageKey);
        }
    }

    // ------------------------------------------------------------------- rules

    public List<NumberingRule> rules() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.mapper.findRules(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    public NumberingRule ruleForGroup(int groupId) {
        return this.mapper.findRuleByGroup(groupId);
    }

    /**
     * <p>Creates or updates the rule for a group.</p>
     *
     * <p>The configuration is chosen, never created: several groups pointing at the same
     * configuration is the normal case, and the whole reason the rule is keyed on the group.
     * A group named but not selected is created here, so adding a location does not mean
     * a detour to the Groups page first.</p>
     *
     * @param groupName optional name of a group to create or reuse when the rule carries no
     *                  group id yet.
     * @param overwrite whether an existing rule for the group may be replaced.
     */
    @Transactional
    public NumberingRule saveRule(NumberingRule rule, String groupName, boolean overwrite) {
        return SecurityContext.get().getCurrentUser().map(user -> {

            if (rule.getPrefix() == null || rule.getPrefix().trim().isEmpty()) {
                throw new RuleException("plugin.deviceenroll.error.prefix.required");
            }
            if (rule.getConfigurationId() <= 0) {
                throw new RuleException("plugin.deviceenroll.error.configuration.required");
            }

            rule.setCustomerId(user.getCustomerId());
            rule.setPrefix(rule.getPrefix().trim().toUpperCase());
            if (rule.getDigits() < 1 || rule.getDigits() > 8) {
                rule.setDigits(3);
            }
            if (rule.getNextSeq() < 1) {
                rule.setNextSeq(1);
            }

            if (rule.getGroupId() <= 0) {
                String name = groupName == null ? null : groupName.trim();
                if (name == null || name.isEmpty()) {
                    throw new RuleException("plugin.deviceenroll.error.group.required");
                }
                Integer existingGroupId = this.mapper.findGroupIdByName(user.getCustomerId(), name);
                if (existingGroupId != null) {
                    rule.setGroupId(existingGroupId);
                } else {
                    Group group = new Group();
                    group.setName(name);
                    this.groupDAO.insertGroup(group);
                    rule.setGroupId(group.getId());
                    log.info("Created group '{}' (id {}) for an enrollment rule", name, group.getId());
                }
            }

            NumberingRule existing = this.mapper.findRuleByGroup(rule.getGroupId());
            if (existing != null && !overwrite
                    && (rule.getId() == null || !rule.getId().equals(existing.getId()))) {
                throw new RuleException("plugin.deviceenroll.error.rule.exists");
            }
            if (existing != null) {
                // Never rewind a live sequence just because the form round-tripped an old value.
                rule.setNextSeq(Math.max(rule.getNextSeq(), existing.getNextSeq()));
            }

            this.mapper.upsertRule(rule);
            log.info("Saved enrollment rule {}", rule);
            return this.mapper.findRuleByGroup(rule.getGroupId());
        }).orElseThrow(() -> new RuleException("error.no.user"));
    }

    public void deleteRule(int id) {
        this.mapper.deleteRule(id);
    }

    // ------------------------------------------------------------- assignments

    public List<NumberAssignment> assignments() {
        return SecurityContext.get().getCurrentUser()
                .map(user -> this.mapper.findAssignments(user.getCustomerId()))
                .orElse(Collections.emptyList());
    }

    public NumberAssignment findAssignment(int deviceId) {
        return this.mapper.findAssignment(deviceId);
    }

    /**
     * <p>Allocates and applies the next number for a freshly enrolled device.</p>
     *
     * <p>Returns the new number, or null if nothing was done - no rule for any group the
     * device belongs to, the device already conforms, it enrolled too long ago to be a
     * fresh enrolment, or every candidate number was taken.</p>
     */
    @Transactional
    public String assignNumber(int deviceId) {
        NumberingRule rule = this.mapper.findRuleForDevice(deviceId);
        if (rule == null || rule.getPrefix() == null) {
            return null;
        }

        String current = this.mapper.getDeviceNumber(deviceId);
        if (current != null && current.startsWith(rule.getPrefix())) {
            // Already looks like one of ours - most likely a device that kept its number
            // across a re-sync. Leave it alone.
            return null;
        }

        Long enrollTime = this.mapper.getDeviceEnrollTime(deviceId);
        if (enrollTime != null && System.currentTimeMillis() - enrollTime > ENROLLMENT_WINDOW_MS) {
            log.info("Device id {} ('{}') is in group '{}' but enrolled more than a day ago, "
                     + "so it is left alone. Renumbering only applies to devices enrolled from "
                     + "the group's QR code.", deviceId, current, rule.getGroupName());
            return null;
        }

        Integer customerId = this.mapper.getDeviceCustomerId(deviceId);
        if (customerId == null) {
            return null;
        }

        // devices.number is unique, so skip past any number already taken - which is what
        // happens when a device was renamed by hand.
        for (int attempt = 0; attempt < 50; attempt++) {
            Integer seq = this.mapper.allocateSequence(rule.getId());
            if (seq == null) {
                return null;
            }
            String candidate = rule.getPrefix() + pad(seq, rule.getDigits());
            if (this.mapper.countByNumber(candidate) > 0) {
                log.warn("Number {} is already taken, skipping to the next in the sequence", candidate);
                continue;
            }

            this.mapper.renameDevice(deviceId, candidate);

            NumberAssignment assignment = new NumberAssignment();
            assignment.setDeviceId(deviceId);
            assignment.setCustomerId(customerId);
            assignment.setOriginalNumber(current);
            assignment.setAssignedNumber(candidate);
            assignment.setAssignTime(System.currentTimeMillis());
            this.mapper.insertAssignment(assignment);

            log.info("Device id {} enrolled into group '{}' as '{}' and was renumbered to '{}'",
                     deviceId, rule.getGroupName(), current, candidate);
            return candidate;
        }

        log.error("Gave up allocating a number for device id {} after 50 attempts", deviceId);
        return null;
    }

    private static String pad(int value, int digits) {
        String s = String.valueOf(value);
        StringBuilder sb = new StringBuilder();
        for (int i = s.length(); i < digits; i++) {
            sb.append('0');
        }
        return sb.append(s).toString();
    }
}
