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

package com.hmdm.plugins.xtra.guice;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Module;
import com.google.inject.Stage;
import com.google.inject.servlet.GuiceServletContextListener;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.LinkedList;
import java.util.List;

import com.hmdm.guice.module.PersistenceModule;
import com.hmdm.guice.module.ConfigureModule;
import com.hmdm.plugin.guice.module.PluginPlatformPersistenceModule;
import com.hmdm.plugins.xtra.guice.module.XtraLiquibaseModule;
import com.hmdm.plugins.xtra.guice.module.XtraTaskModule;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;

public final class Initializer extends GuiceServletContextListener {
    private ServletContext context;
    private ServletContext coreContext;
    private Injector injector;

    public Initializer() {
    }

    protected Injector getInjector() {
        boolean success = false;

        final StringWriter errorOut = new StringWriter();
        PrintWriter errorWriter = new PrintWriter(errorOut);
        try {
            this.injector = Guice.createInjector(Stage.PRODUCTION, this.getModules());
            success = true;
        } catch (Exception e){
            System.err.println("[HMDM-XTRA-INITIALIZER]: Unexpected error during injector initialization: " + e);
            e.printStackTrace();
            e.printStackTrace(errorWriter);
        }
        if (success) {
            System.out.println("[HMDM-XTRA-INITIALIZER]: Application initialization was successful");
            onInitializationCompletion(null);
        } else {
            System.out.println("[HMDM-XTRA-INITIALIZER]: Application initialization has failed");
            onInitializationCompletion(errorOut);
        }
        return injector;
    }

    /**
     * <p>Signals on application initialization completion.</p>
     */
    private void onInitializationCompletion(StringWriter errorOut) {
    }

    public void contextInitialized(ServletContextEvent servletContextEvent) {
        this.context = servletContextEvent.getServletContext();
        this.coreContext = this.context.getContext("/");

        String log4jConfig = coreContext.getInitParameter("log4j.config");
        if (log4jConfig != null && !log4jConfig.isEmpty()) {
            System.out.println("[HMDM-XTRA-LOGGING] : Using log4j configuration from: " + log4jConfig);
            System.setProperty("log4j.configuration", log4jConfig);
            System.setProperty("log4j.ignoreTCL", "true");
        } else {
            System.out.println("[HMDM-XTRA-LOGGING] Using log4j configuration from build");
        }

        super.contextInitialized(servletContextEvent);

        initTasks();
    }

    private List<Module> getModules() {
        List<Module> modules = new LinkedList<>();
        // Core modules
        modules.add(new ConfigureModule(this.coreContext));
        modules.add(new PersistenceModule(this.coreContext));
        modules.add(new PluginPlatformPersistenceModule(this.coreContext));

        // Own modules
        modules.add(new XtraLiquibaseModule(this.coreContext));
        return modules;
    }

    private void initTasks() {
        final XtraTaskModule taskModule = this.injector.getInstance(XtraTaskModule.class);
        taskModule.init();
    }
}
