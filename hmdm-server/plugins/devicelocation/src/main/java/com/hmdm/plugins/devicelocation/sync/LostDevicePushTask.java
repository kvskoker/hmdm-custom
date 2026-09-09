package com.hmdm.plugins.devicelocation.sync;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.notification.PushService;
import com.hmdm.notification.persistence.domain.PushMessage;
import com.hmdm.plugins.devicelocation.persistence.DeviceLocationDAO;
import com.hmdm.plugins.devicelocation.persistence.domain.DeviceLocationSettings;
import com.hmdm.plugins.devicelocation.persistence.domain.LostDevice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>Keeps a lost device reporting frequently by asking it to sync.</p>
 *
 * <p>The launcher decides for itself how often to send its position: once after every
 * configuration update, and otherwise on a fifteen-minute WorkManager job whose period is a
 * compile-time constant in the APK. Nothing the server sends changes that number, so the
 * only way to hear from a device sooner is to give it a reason to sync - and a
 * <code>configUpdated</code> push does exactly that. The launcher pulls its configuration
 * and posts fresh device info, position included.</p>
 *
 * <p>So this task pushes each lost device on the interval an administrator asked for. It is
 * the whole mechanism behind "every two minutes while lost", and it needs push to be
 * working: without a reachable MQTT broker a lost device still reports, just on the
 * launcher's own fifteen-minute schedule.</p>
 */
@Singleton
public class LostDevicePushTask implements Runnable {

    private static final Logger log = LoggerFactory.getLogger(LostDevicePushTask.class);

    private final DeviceLocationDAO dao;
    private final PushService pushService;

    /** Last push per device, so the interval is honoured across runs. */
    private final Map<Integer, Long> lastPush = new HashMap<>();

    @Inject
    public LostDevicePushTask(DeviceLocationDAO dao, PushService pushService) {
        this.dao = dao;
        this.pushService = pushService;
    }

    @Override
    public void run() {
        try {
            List<LostDevice> lost = this.dao.allLostDevices();
            if (lost.isEmpty()) {
                if (!lastPush.isEmpty()) {
                    lastPush.clear();
                }
                return;
            }

            long now = System.currentTimeMillis();
            for (LostDevice device : lost) {
                try {
                    DeviceLocationSettings settings = this.dao.settingsFor(device.getCustomerId());
                    long intervalMs = Math.max(1, settings.getLostIntervalMins()) * 60_000L;

                    Long previous = lastPush.get(device.getDeviceId());
                    if (previous != null && now - previous < intervalMs) {
                        continue;
                    }

                    this.pushService.sendSimpleMessage(device.getDeviceId(),
                                                       PushMessage.TYPE_CONFIG_UPDATED);
                    lastPush.put(device.getDeviceId(), now);
                    log.debug("Asked lost device id {} ('{}') to sync", device.getDeviceId(),
                              device.getDeviceNumber());
                } catch (Exception e) {
                    log.error("Failed to ask lost device id " + device.getDeviceId()
                              + " to sync", e);
                }
            }

            // Devices that are no longer lost should not keep a slot in the map.
            lastPush.keySet().removeIf(deviceId ->
                    lost.stream().noneMatch(d -> d.getDeviceId() == deviceId));

        } catch (Exception e) {
            // This runs on the shared background task runner; an escaping exception would
            // stop it rescheduling and silently end tracking for every lost device.
            log.error("Lost device push round failed", e);
        }
    }
}
