/*
 *
 * Headwind MDM: Open Source Android MDM Software
 * https://h-mdm.com
 *
 * Copyright (C) 2019 Headwind Solutions LLC (http://h-sms.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package com.hmdm.plugins.devicelog.guice.module;

import com.google.inject.servlet.ServletModule;
import com.hmdm.plugin.guice.module.AbstractPluginRestModule;
import com.hmdm.plugin.rest.PluginAccessFilter;
import com.hmdm.plugins.devicelog.DeviceLogPluginConfigurationImpl;
import com.hmdm.plugins.devicelog.rest.resource.DeviceLogSettingsResource;
import com.hmdm.plugins.devicelog.rest.resource.DeviceLogPublicResource;
import com.hmdm.plugins.devicelog.rest.resource.DeviceLogResource;
import com.hmdm.rest.filter.AuthFilter;
import com.hmdm.rest.filter.PrivateIPFilter;
import com.hmdm.rest.filter.PublicIPFilter;
import com.hmdm.security.jwt.JWTFilter;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

/**
 * <p>A <code>Guice</code> module for <code>Device Log Plugin</code> REST resources.</p>
 *
 * @author isv
 */
public class DeviceLogRestModule extends AbstractPluginRestModule {

    @Override
    protected List<String> getProtectedResources() {
        return Arrays.asList(
                "/rest/private/plugin-devicelog/*"
        );
    }

    @Override
    protected List<String> getPublicResources() {
        return Arrays.asList(
                "/rest/public/plugin-devicelog/*",
                "/rest/plugins/devicelog/log/*"      // Old format, for backward compatibility
        );
    }

    @Override
    protected String getPluginId() {
        return DeviceLogPluginConfigurationImpl.PLUGIN_ID;
    }

    /**
     * <p>Constructs new <code>DeviceLogRestModule</code> instance. This implementation does nothing.</p>
     */
    public DeviceLogRestModule() {
    }

    /**
     * <p>Configures the <code>Device Log</code> REST resources.</p>
     */
    protected void configureServlets() {
        super.configureServlets();
        this.bind(DeviceLogSettingsResource.class);
        this.bind(DeviceLogPublicResource.class);
        this.bind(DeviceLogResource.class);
    }

}
