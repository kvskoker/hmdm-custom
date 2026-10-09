package com.hmdm.plugins.messaging.guice.module;

import com.google.inject.Inject;
import com.hmdm.plugin.PluginTaskModule;
import com.hmdm.plugin.service.PluginVersionService;
import com.hmdm.plugin.persistence.PluginDAO;
import com.hmdm.plugins.messaging.MessagingPluginConfigurationImpl;

public class MessagingTaskModule implements PluginTaskModule {
    private final PluginDAO pluginDAO;

    /**
     * <p>Constructs new <code>MessagingTaskModule</code> instance. This implementation does nothing.</p>
     *
     * @param pluginDAO
     */
    @Inject
    public MessagingTaskModule(PluginDAO pluginDAO) {
        this.pluginDAO = pluginDAO;
    }

    private String getPluginId() {
        return MessagingPluginConfigurationImpl.PLUGIN_ID;
    }

    @Override
    public void init() {
        pluginDAO.updatePluginVersion(getPluginId(), PluginVersionService.getVersion(this.getClass(), getPluginId()));
    }
}
