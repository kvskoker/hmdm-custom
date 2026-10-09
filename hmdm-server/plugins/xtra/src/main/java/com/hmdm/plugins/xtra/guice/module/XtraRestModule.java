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

package com.hmdm.plugins.xtra.guice.module;

import com.hmdm.plugin.guice.module.AbstractPluginRestModule;
import com.hmdm.plugins.xtra.XtraPluginConfigurationImpl;
import com.hmdm.plugins.xtra.rest.XtraResource;

import java.util.Arrays;
import java.util.List;

/**
 * <p>A <code>Guice</code> module for <code>Xtra Plugin</code> REST resources.</p>
 *
 * @author isv
 */
public class XtraRestModule extends AbstractPluginRestModule {

    /**
     * <p>A list of patterns for URIs for plugin resources which prohibit anonymous access.</p>
     */
    @Override
    protected List<String> getProtectedResources() {
        // Note: this URL should be also added as exclusion in common/AuthFilter to skip 2FA check
        return Arrays.asList(
                "/rest/private/plugin-xtra/*"
        );
    }

    @Override
    protected List<String> getPublicResources() {
        return Arrays.asList(
        );
    }

    @Override
    protected String getPluginId() {
        return XtraPluginConfigurationImpl.PLUGIN_ID;
    }

    /**
     * <p>Constructs new <code>XtraRestModule</code> instance. This implementation does nothing.</p>
     */
    public XtraRestModule() {
    }

    /**
     * <p>Configures the <code>Xtra Plugin</code> REST resources.</p>
     */
    protected void configureServlets() {
        super.configureServlets();
        this.bind(XtraResource.class);
    }

}
