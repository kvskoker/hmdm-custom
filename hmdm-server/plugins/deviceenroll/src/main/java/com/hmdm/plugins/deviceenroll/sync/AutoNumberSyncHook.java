package com.hmdm.plugins.deviceenroll.sync;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.plugins.deviceenroll.persistence.DeviceEnrollDAO;
import com.hmdm.rest.json.SyncResponseHook;
import com.hmdm.rest.json.SyncResponseInt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Gives a newly enrolled device its permanent number.
 *
 * The device scans its group's QR code, enrols under whatever the launcher supplied
 * (typically its serial), and this hook renames it to the next number in that group's
 * sequence - returning newNumber so the device adopts the new identity for its next
 * sync. The group came from the QR code itself: the core put the device in it before
 * this hook ever runs.
 *
 * An assignment row is written the first time, and its presence is what stops a
 * device being renumbered on every subsequent sync.
 */
@Singleton
public class AutoNumberSyncHook implements SyncResponseHook {

    private static final Logger log = LoggerFactory.getLogger(AutoNumberSyncHook.class);

    private final DeviceEnrollDAO dao;

    @Inject
    public AutoNumberSyncHook(DeviceEnrollDAO dao) {
        this.dao = dao;
    }

    @Override
    public SyncResponseInt handle(int deviceId, SyncResponseInt original) {
        try {
            if (this.dao.findAssignment(deviceId) != null) {
                return original;   // already numbered by us
            }
            String assigned = this.dao.assignNumber(deviceId);
            if (assigned != null) {
                original.setNewNumber(assigned);
            }
        } catch (Exception e) {
            // Numbering must never stop a device from syncing.
            log.error("Failed to assign a number to device id " + deviceId, e);
        }
        return original;
    }
}
