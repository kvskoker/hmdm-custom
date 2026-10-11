package com.hmdm.persistence;

import com.google.inject.Inject;
import com.hmdm.persistence.mapper.DeviceRegisterMapper;
import org.mybatis.guice.transactional.Transactional;

public class DeviceRegisterDAO {
    private final DeviceRegisterMapper mapper;
    @Inject public DeviceRegisterDAO(DeviceRegisterMapper mapper) { this.mapper = mapper; }

    @Transactional
    public void save(int customer, int user, String rows, int expected) {
        if (mapper.save(customer, user, rows) != expected) {
            throw new IllegalStateException("Device access changed. Reload and retry; no updates were saved.");
        }
    }
}
