package com.hmdm.guice.module;

import com.google.inject.Scopes;
import com.google.inject.servlet.ServletModule;
import com.hmdm.rest.filter.ApiOriginFilter;
import org.glassfish.jersey.servlet.ServletContainer;

import java.util.HashMap;
import java.util.Map;

/**
 * <p>A main module for REST API. Configures the common behavior for all resources.</p>
 *
 * @author isv
 */
public class MainRestModule extends ServletModule {

    /**
     * <p>Constructs new <code>MainRestModule</code> instance. This implementation does nothing.</p>
     */
    public MainRestModule() {
    }

    protected void configureServlets() {
        this.filter("/rest/*").through(ApiOriginFilter.class);
    }

}
