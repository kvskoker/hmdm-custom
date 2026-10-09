package com.hmdm.plugins.xtra.guice.module;

import com.google.inject.Inject;
import com.hmdm.plugin.PluginTaskModule;
import com.hmdm.plugin.service.PluginVersionService;
import com.hmdm.plugin.persistence.PluginDAO;
import com.hmdm.plugins.xtra.XtraPluginConfigurationImpl;

public class XtraTaskModule implements PluginTaskModule {
    private final PluginDAO pluginDAO;

    /**
     * <p>Constructs new <code>XtraTaskModule</code> instance. This implementation does nothing.</p>
     *
     * @param pluginDAO
     */
    @Inject
    public XtraTaskModule(PluginDAO pluginDAO) {
        this.pluginDAO = pluginDAO;
    }

    private String getPluginId() {
        return XtraPluginConfigurationImpl.PLUGIN_ID;
    }

    @Override
    public void init() {
        pluginDAO.updatePluginVersion(getPluginId(), PluginVersionService.getVersion(this.getClass(), getPluginId()));
    }
}
