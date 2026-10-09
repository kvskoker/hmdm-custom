package com.hmdm.plugins.push.guice.module;

import com.google.inject.Inject;
import com.hmdm.plugin.PluginTaskModule;
import com.hmdm.plugin.persistence.PluginDAO;
import com.hmdm.plugin.service.PluginVersionService;
import com.hmdm.plugins.push.PushPluginConfigurationImpl;

public class PushTaskModule implements PluginTaskModule {
    private final PluginDAO pluginDAO;

    /**
     * <p>Constructs new <code>PushTaskModule</code> instance. This implementation does nothing.</p>
     *
     * @param pluginDAO
     */
    @Inject
    public PushTaskModule(PluginDAO pluginDAO) {
        this.pluginDAO = pluginDAO;
    }

    private String getPluginId() {
        return PushPluginConfigurationImpl.PLUGIN_ID;
    }

    @Override
    public void init() {
        pluginDAO.updatePluginVersion(getPluginId(), PluginVersionService.getVersion(this.getClass(), getPluginId()));
    }
}
