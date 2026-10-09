package com.hmdm.plugins.deviceenroll.guice.module;

import com.hmdm.guice.module.AbstractLiquibaseModule;

import jakarta.servlet.ServletContext;

public class DeviceEnrollLiquibaseModule extends AbstractLiquibaseModule {

    public DeviceEnrollLiquibaseModule(ServletContext context) {
        super(context);
    }

    @Override
    protected String getChangeLogResourcePath() {
        return "classpath:liquibase/deviceenroll.changelog.xml";
    }
}
