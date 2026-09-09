package com.hmdm.plugins.deviceenroll.guice.module;

import com.google.inject.Singleton;
import com.google.inject.servlet.ServletModule;
import com.hmdm.plugin.rest.PluginAccessFilter;
import com.hmdm.plugins.deviceenroll.rest.DeviceEnrollResource;
import com.hmdm.plugins.deviceenroll.sync.AutoNumberSyncHook;
import com.hmdm.rest.filter.AuthFilter;
import com.hmdm.rest.filter.PrivateIPFilter;
import com.hmdm.rest.json.SyncResponseHook;
import com.hmdm.security.jwt.JWTFilter;

import java.util.Arrays;
import java.util.List;

public class DeviceEnrollRestModule extends ServletModule {

    private static final List<String> protectedResources = Arrays.asList(
            "/rest/plugins/deviceenroll/private/*"
    );

    public DeviceEnrollRestModule() {
    }

    protected void configureServlets() {
        this.filter(protectedResources).through(JWTFilter.class);
        this.filter(protectedResources).through(AuthFilter.class);
        this.filter(protectedResources).through(PluginAccessFilter.class);
        this.filter(protectedResources).through(PrivateIPFilter.class);
        this.bind(DeviceEnrollResource.class);

        // Discovered by SyncResource's injector scan alongside the devicereset hook.
        this.bind(AutoNumberSyncHook.class).in(Singleton.class);
    }
}
