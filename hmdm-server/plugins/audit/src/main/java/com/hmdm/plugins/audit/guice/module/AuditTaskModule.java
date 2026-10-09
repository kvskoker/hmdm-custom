package com.hmdm.plugins.audit.guice.module;

import com.google.inject.Inject;
import com.hmdm.plugin.PluginTaskModule;
import com.hmdm.plugin.service.PluginVersionService;
import com.hmdm.plugin.persistence.PluginDAO;
import com.hmdm.plugins.audit.AuditPluginConfigurationImpl;

public class AuditTaskModule implements PluginTaskModule {
    private final PluginDAO pluginDAO;

    /**
     * <p>Constructs new <code>AuditTaskModule</code> instance. This implementation does nothing.</p>
     *
     * @param pluginDAO
     */
    @Inject
    public AuditTaskModule(PluginDAO pluginDAO) {
        this.pluginDAO = pluginDAO;
    }

    private String getPluginId() {
        return AuditPluginConfigurationImpl.PLUGIN_ID;
    }

    @Override
    public void init() {
        pluginDAO.updatePluginVersion(getPluginId(), PluginVersionService.getVersion(this.getClass(), getPluginId()));
    }
}
