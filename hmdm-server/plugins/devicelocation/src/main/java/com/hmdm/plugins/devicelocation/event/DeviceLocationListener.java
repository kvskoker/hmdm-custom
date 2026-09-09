package com.hmdm.plugins.devicelocation.event;

import com.hmdm.event.DeviceLocationUpdatedEvent;
import com.hmdm.event.EventListener;
import com.hmdm.event.EventType;
import com.hmdm.plugins.devicelocation.persistence.DeviceLocationDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>Stores every position the core hands us.</p>
 *
 * <p>There are two producers and both matter: the launcher includes its last known fix in
 * the device info it posts on each sync, and the deviceinfo plugin forwards whole batches of
 * fixes when a device uploads its dynamic data. Listening to the event rather than to either
 * endpoint means this plugin does not care which path a position arrived by.</p>
 */
public class DeviceLocationListener implements EventListener<DeviceLocationUpdatedEvent> {

    private static final Logger log = LoggerFactory.getLogger(DeviceLocationListener.class);

    private final DeviceLocationDAO dao;

    public DeviceLocationListener(DeviceLocationDAO dao) {
        this.dao = dao;
    }

    @Override
    public void onEvent(DeviceLocationUpdatedEvent event) {
        try {
            this.dao.recordLocations(event.getDeviceId(), event.getLocations());
        } catch (Exception e) {
            // Runs on a background thread on the device's behalf. Losing a position is
            // regrettable; letting it escape and kill the task runner is worse.
            log.error("Failed to record locations for device id " + event.getDeviceId(), e);
        }
    }

    @Override
    public EventType getSupportedEventType() {
        return EventType.DEVICE_LOCATION_UPDATED;
    }
}
