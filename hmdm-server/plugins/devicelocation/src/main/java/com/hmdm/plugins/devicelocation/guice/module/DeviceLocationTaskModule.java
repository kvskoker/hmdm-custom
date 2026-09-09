package com.hmdm.plugins.devicelocation.guice.module;

import com.google.inject.Inject;
import com.hmdm.event.EventService;
import com.hmdm.plugin.PluginTaskModule;
import com.hmdm.plugins.devicelocation.event.DeviceLocationListener;
import com.hmdm.plugins.devicelocation.persistence.DeviceLocationDAO;
import com.hmdm.plugins.devicelocation.sync.LostDevicePushTask;
import com.hmdm.util.BackgroundTaskRunnerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.TimeUnit;

/**
 * <p>Subscribes the plugin to location events. Discovered automatically - the platform
 * scans the plugin's package for {@link PluginTaskModule} implementations and calls
 * {@code init()} once at startup.</p>
 */
public class DeviceLocationTaskModule implements PluginTaskModule {

    private static final Logger log = LoggerFactory.getLogger(DeviceLocationTaskModule.class);

    private final EventService eventService;
    private final DeviceLocationDAO dao;
    private final LostDevicePushTask lostDevicePushTask;
    private final BackgroundTaskRunnerService taskRunner;

    @Inject
    public DeviceLocationTaskModule(EventService eventService,
                                    DeviceLocationDAO dao,
                                    LostDevicePushTask lostDevicePushTask,
                                    BackgroundTaskRunnerService taskRunner) {
        this.eventService = eventService;
        this.dao = dao;
        this.lostDevicePushTask = lostDevicePushTask;
        this.taskRunner = taskRunner;
    }

    @Override
    public void init() {
        this.eventService.addEventListener(new DeviceLocationListener(this.dao));

        // Runs every minute and decides per device whether its interval has elapsed, so a
        // change to the lost interval takes effect without restarting anything.
        this.taskRunner.submitRepeatableTask(this.lostDevicePushTask, 1, 1, TimeUnit.MINUTES);

        // Say so. If this line is missing from the log, the plugin is storing nothing,
        // and that is otherwise completely silent - positions arrive at the core, the
        // event fires, and there is no listener to receive it.
        log.info("Device tracking: listening for device locations, lost-device push armed");
    }
}
