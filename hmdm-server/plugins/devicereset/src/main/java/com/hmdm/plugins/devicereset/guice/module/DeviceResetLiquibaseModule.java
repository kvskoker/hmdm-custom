package com.hmdm.plugins.devicereset.guice.module;

import com.hmdm.guice.module.AbstractLiquibaseModule;

import jakarta.servlet.ServletContext;

public class DeviceResetLiquibaseModule extends AbstractLiquibaseModule {

    public DeviceResetLiquibaseModule(ServletContext context) {
        super(context);
    }

    @Override
    protected String getChangeLogResourcePath() {
        return "classpath:liquibase/devicereset.changelog.xml";
    }
}
