package com.hmdm.plugins.devicelocation.guice.module;

import com.hmdm.guice.module.AbstractLiquibaseModule;

import jakarta.servlet.ServletContext;

public class DeviceLocationLiquibaseModule extends AbstractLiquibaseModule {

    public DeviceLocationLiquibaseModule(ServletContext context) {
        super(context);
    }

    @Override
    protected String getChangeLogResourcePath() {
        return "classpath:liquibase/devicelocation.changelog.xml";
    }
}
