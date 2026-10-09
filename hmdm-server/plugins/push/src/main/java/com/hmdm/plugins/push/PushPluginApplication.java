package com.hmdm.plugins.push;

import com.google.inject.Injector;
import io.swagger.v3.jaxrs2.integration.JaxrsOpenApiContextBuilder;
import io.swagger.v3.jaxrs2.integration.resources.AcceptHeaderOpenApiResource;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import io.swagger.v3.oas.integration.OpenApiConfigurationException;
import io.swagger.v3.oas.integration.SwaggerConfiguration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import jakarta.inject.Inject;
import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.spi.Container;
import org.glassfish.jersey.server.spi.ContainerLifecycleListener;
import org.glassfish.jersey.servlet.ServletContainer;
import org.jvnet.hk2.guice.bridge.api.GuiceBridge;
import org.jvnet.hk2.guice.bridge.api.GuiceIntoHK2Bridge;

import java.util.Set;

/**
 * <p>A configuration for Push plugin when it is built as a WAR module.</p>
 *
 * @author isv
 */
public class PushPluginApplication extends ResourceConfig {

    /**
     * <p>Constructs new <code>PushPluginApplication</code> instance and initializes the Guice-HK2 bridge.</p>
     */
    @Inject
    public PushPluginApplication(final ServiceLocator serviceLocator) {
        packages("com.hmdm.plugins.push");
        register(MultiPartFeature.class);
        register(new ContainerLifecycleListener() {
            public void onStartup(Container container) {
                ServletContainer servletContainer = (ServletContainer) container;
                GuiceBridge.getGuiceBridge().initializeGuiceBridge(serviceLocator);
                GuiceIntoHK2Bridge guiceBridge = serviceLocator.getService(GuiceIntoHK2Bridge.class);
                Injector injector = (Injector) servletContainer.getServletContext().getAttribute(Injector.class.getName());
                guiceBridge.bridgeGuiceInjector(injector);

                String baseUrl = servletContainer.getServletContext().getContextPath() + "/rest";

                OpenAPI openAPI = new OpenAPI()
                        .info(new Info()
                                .title("Headwind MDM Push Plugin API")
                                .version("0.0.2"))
                        .addServersItem(new Server().url(baseUrl));

                SwaggerConfiguration oasConfig = new SwaggerConfiguration()
                        .openAPI(openAPI)
                        .prettyPrint(true)
                        .resourcePackages(Set.of("com.hmdm.plugins.push"));

                try {
                    new JaxrsOpenApiContextBuilder<>()
                            .openApiConfiguration(oasConfig)
                            .buildContext(true);
                } catch (OpenApiConfigurationException e) {
                    e.printStackTrace();
                }

            }

            public void onReload(Container container) {
            }

            public void onShutdown(Container container) {
            }
        });

        register(OpenApiResource.class);
        register(AcceptHeaderOpenApiResource.class);

    }

}
