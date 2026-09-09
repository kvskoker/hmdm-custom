package com.hmdm.plugins.devicelocation.sync;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.persistence.domain.RequestUpdatesType;
import com.hmdm.plugins.devicelocation.persistence.DeviceLocationDAO;
import com.hmdm.rest.json.SyncResponseHook;
import com.hmdm.rest.json.SyncResponseInt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>Turns location collection on for a device that has been reported lost.</p>
 *
 * <p>Whether the launcher collects a position at all is a property of the configuration
 * ({@code requestUpdates}), and for everyday use a fleet may well have it set to
 * DONOTTRACK. A missing device is the one case where that answer is wrong, and changing
 * the configuration to chase one device would change it for every device sharing it. So the
 * override happens here, per device, for exactly as long as the flag is set.</p>
 */
@Singleton
public class LocationSyncHook implements SyncResponseHook {

    private static final Logger log = LoggerFactory.getLogger(LocationSyncHook.class);

    private final DeviceLocationDAO dao;

    @Inject
    public LocationSyncHook(DeviceLocationDAO dao) {
        this.dao = dao;
    }

    @Override
    public SyncResponseInt handle(int deviceId, SyncResponseInt original) {
        try {
            boolean lost = this.dao.isLost(deviceId);
            boolean trackAll = false;
            if (!lost) {
                Integer customerId = this.dao.customerIdOf(deviceId);
                trackAll = customerId != null
                        && this.dao.settingsFor(customerId).isTrackAllDevices();
            }

            if (lost || trackAll) {
                original.setRequestUpdates(RequestUpdatesType.GPS.getTransmittedValue());
                // Location permission is granted by the device owner app; a configuration
                // that suppresses it would leave the device unable to answer.
                original.setDisableLocation(Boolean.FALSE);
                log.debug("Device id {}: location collection forced on ({})",
                          deviceId, lost ? "reported lost" : "tracking enabled for all devices");
            }
        } catch (Exception e) {
            // Tracking must never stop a device from syncing.
            log.error("Failed to apply location tracking for device id " + deviceId, e);
        }
        return original;
    }
}
