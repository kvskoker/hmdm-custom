package com.hmdm.plugins.deviceenroll.guice.module;

import com.hmdm.guice.module.AbstractPersistenceModule;

import jakarta.servlet.ServletContext;

public class DeviceEnrollPersistenceModule extends AbstractPersistenceModule {

    public DeviceEnrollPersistenceModule(ServletContext context) {
        super(context);
    }

    @Override
    protected String getMapperPackageName() {
        return "com.hmdm.plugins.deviceenroll.persistence.mapper";
    }

    @Override
    protected String getDomainObjectsPackageName() {
        return "com.hmdm.plugins.deviceenroll.persistence.domain";
    }
}
