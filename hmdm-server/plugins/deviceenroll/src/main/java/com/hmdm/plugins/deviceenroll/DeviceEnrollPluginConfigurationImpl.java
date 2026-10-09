package com.hmdm.plugins.deviceenroll;

import com.google.inject.Module;
import com.hmdm.plugin.PluginConfiguration;
import com.hmdm.plugins.deviceenroll.guice.module.DeviceEnrollLiquibaseModule;
import com.hmdm.plugins.deviceenroll.guice.module.DeviceEnrollPersistenceModule;
import com.hmdm.plugins.deviceenroll.guice.module.DeviceEnrollRestModule;

import jakarta.servlet.ServletContext;
import java.util.ArrayList;
import java.util.List;

public class DeviceEnrollPluginConfigurationImpl implements PluginConfiguration {

    public static final String PLUGIN_ID = "deviceenroll";

    public DeviceEnrollPluginConfigurationImpl() {
    }

    @Override
    public String getPluginId() {
        return PLUGIN_ID;
    }

    @Override
    public String getRootPackage() {
        return "com.hmdm.plugins.deviceenroll";
    }

    @Override
    public List<Module> getPluginModules(ServletContext context) {
        List<Module> modules = new ArrayList<>();
        modules.add(new DeviceEnrollLiquibaseModule(context));
        modules.add(new DeviceEnrollPersistenceModule(context));
        modules.add(new DeviceEnrollRestModule());
        return modules;
    }
}
