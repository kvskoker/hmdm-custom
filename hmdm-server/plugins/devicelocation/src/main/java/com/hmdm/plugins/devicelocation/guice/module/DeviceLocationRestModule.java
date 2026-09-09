package com.hmdm.plugins.devicelocation.guice.module;

import com.google.inject.Singleton;
import com.google.inject.servlet.ServletModule;
import com.hmdm.plugin.rest.PluginAccessFilter;
import com.hmdm.plugins.devicelocation.rest.DeviceLocationResource;
import com.hmdm.plugins.devicelocation.sync.LocationSyncHook;
import com.hmdm.plugins.devicelocation.sync.LostDevicePushTask;
import com.hmdm.rest.filter.AuthFilter;
import com.hmdm.rest.filter.PrivateIPFilter;
import com.hmdm.security.jwt.JWTFilter;

import java.util.Arrays;
import java.util.List;

public class DeviceLocationRestModule extends ServletModule {

    private static final List<String> protectedResources = Arrays.asList(
            "/rest/plugins/devicelocation/private/*"
    );

    public DeviceLocationRestModule() {
    }

    protected void configureServlets() {
        this.filter(protectedResources).through(JWTFilter.class);
        this.filter(protectedResources).through(AuthFilter.class);
        this.filter(protectedResources).through(PluginAccessFilter.class);
        this.filter(protectedResources).through(PrivateIPFilter.class);
        this.bind(DeviceLocationResource.class);

        // Bound by concrete class: SyncResource collects every binding assignable to
        // SyncResponseHook, and binding the interface itself would collide with the
        // devicereset and deviceenroll hooks.
        this.bind(LocationSyncHook.class).in(Singleton.class);
        this.bind(LostDevicePushTask.class).in(Singleton.class);
    }
}
