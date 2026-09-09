package com.hmdm.plugins.devicelocation;

import com.google.inject.Module;
import com.hmdm.plugin.PluginConfiguration;
import com.hmdm.plugin.PluginTaskModule;
import com.hmdm.plugins.devicelocation.guice.module.DeviceLocationLiquibaseModule;
import com.hmdm.plugins.devicelocation.guice.module.DeviceLocationPersistenceModule;
import com.hmdm.plugins.devicelocation.guice.module.DeviceLocationRestModule;
import com.hmdm.plugins.devicelocation.guice.module.DeviceLocationTaskModule;

import javax.servlet.ServletContext;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class DeviceLocationPluginConfigurationImpl implements PluginConfiguration {

    public static final String PLUGIN_ID = "devicelocation";

    public DeviceLocationPluginConfigurationImpl() {
    }

    @Override
    public String getPluginId() {
        return PLUGIN_ID;
    }

    @Override
    public String getRootPackage() {
        return "com.hmdm.plugins.devicelocation";
    }

    @Override
    public List<Module> getPluginModules(ServletContext context) {
        List<Module> modules = new ArrayList<>();
        modules.add(new DeviceLocationLiquibaseModule(context));
        modules.add(new DeviceLocationPersistenceModule(context));
        modules.add(new DeviceLocationRestModule());
        return modules;
    }

    /**
     * <p>Declares the task module. This is not optional and it is not discovered.</p>
     *
     * <p>PluginList scans for PluginConfiguration implementations only; task modules are
     * whatever each configuration hands back here, and the interface method defaults to
     * Optional.empty(). A plugin that writes a PluginTaskModule and forgets this line
     * compiles, deploys, starts, logs nothing - and its init() never runs. For this plugin
     * that meant the location event listener was never registered, so every position a
     * device sent was received by the core and then dropped on the floor.</p>
     */
    @Override
    public Optional<List<Class<? extends PluginTaskModule>>> getTaskModules(ServletContext context) {
        List<Class<? extends PluginTaskModule>> modules = new ArrayList<>();
        modules.add(DeviceLocationTaskModule.class);
        return Optional.of(modules);
    }
}
