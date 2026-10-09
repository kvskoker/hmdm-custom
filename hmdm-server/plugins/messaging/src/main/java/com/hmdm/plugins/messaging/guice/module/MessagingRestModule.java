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

package com.hmdm.plugins.messaging.guice.module;

import com.google.inject.servlet.ServletModule;
import com.hmdm.plugin.guice.module.AbstractPluginRestModule;
import com.hmdm.plugin.rest.PluginAccessFilter;
import com.hmdm.plugins.messaging.MessagingPluginConfigurationImpl;
import com.hmdm.plugins.messaging.rest.MessagingPublicResource;
import com.hmdm.plugins.messaging.rest.MessagingResource;
import com.hmdm.rest.filter.AuthFilter;
import com.hmdm.rest.filter.PrivateIPFilter;
import com.hmdm.rest.filter.PublicIPFilter;
import com.hmdm.security.jwt.JWTFilter;

import java.util.Arrays;
import java.util.List;

/**
 * <p>A <code>Guice</code> module for <code>Messaging Plugin</code> REST resources.</p>
 *
 * @author isv
 */
public class MessagingRestModule extends AbstractPluginRestModule {

    /**
     * <p>A list of patterns for URIs for plugin resources which prohibit anonymous access.</p>
     */
    @Override
    protected List<String> getProtectedResources() {
        return Arrays.asList(
                "/rest/private/plugin-messaging/*"
        );
    }

    @Override
    protected List<String> getPublicResources() {
        return Arrays.asList(
            "/rest/public/plugin-messaging/*"
        );
    }

    @Override
    protected String getPluginId() {
        return MessagingPluginConfigurationImpl.PLUGIN_ID;
    }

    /**
     * <p>Constructs new <code>MessagingRestModule</code> instance. This implementation does nothing.</p>
     */
    public MessagingRestModule() {
    }

    /**
     * <p>Configures the <code>Messaging Plugin</code> REST resources.</p>
     */
    protected void configureServlets() {
        super.configureServlets();
        this.bind(MessagingResource.class);
        this.bind(MessagingPublicResource.class);
    }

}
