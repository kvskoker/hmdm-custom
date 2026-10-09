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

package com.hmdm.plugins.deviceinfo.rest;

import com.hmdm.event.DeviceLocationUpdatedEvent;
import com.hmdm.event.EventService;
import com.hmdm.persistence.DeviceDAO;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Device;
import com.hmdm.plugin.service.PluginStatusCache;
import com.hmdm.plugins.deviceinfo.persistence.DeviceInfoDAO;
import com.hmdm.plugins.deviceinfo.persistence.DeviceInfoSettingsDAO;
import com.hmdm.plugins.deviceinfo.persistence.domain.DeviceDynamicInfo;
import com.hmdm.plugins.deviceinfo.persistence.domain.DeviceInfoPluginSettings;
import com.hmdm.plugins.deviceinfo.rest.json.*;
import com.hmdm.plugins.deviceinfo.service.DeviceInfoExportService;
import com.hmdm.rest.json.DeviceLocation;
import com.hmdm.rest.json.DeviceLookupItem;
import com.hmdm.rest.json.PaginatedData;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.StreamingOutput;
import org.glassfish.jersey.media.multipart.ContentDisposition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import static com.hmdm.plugins.deviceinfo.DeviceInfoPluginConfigurationImpl.PLUGIN_ID;

/**
 * <p>A resource to be used for managing the <code>Device Info</code> plugin data for customer account associated
 * with current user.</p>
 *
 * @author isv
 */
@Singleton
// For backward compatibility (works as JAR only!)
//@Path("/public/plugin-deviceinfo")
@Path("")
@Tag(name = "Device Info plugin Public Resource")
public class DeviceInfoPublicResource {

    private static final Logger logger = LoggerFactory.getLogger(DeviceInfoPublicResource.class);

    /**
     * <p>An interface to device info records persistence.</p>
     */
    private DeviceInfoDAO deviceInfoDAO;

    /**
     * <p>An interface to persistence without security checks.</p>
     */
    private UnsecureDAO unsecureDAO;

    private DeviceInfoSettingsDAO settingsDAO;

    private PluginStatusCache pluginStatusCache;

    /**
     * <p>A service used for sending notifications on location update for device</p>
     */
    private EventService eventService;

    /**
     * <p>A constructor required by swagger.</p>
     */
    public DeviceInfoPublicResource() {
    }

    /**
     * <p>Constructs new <code>DeviceInfoResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public DeviceInfoPublicResource(DeviceInfoDAO deviceInfoDAO,
                                    DeviceInfoSettingsDAO settingsDAO,
                                    UnsecureDAO unsecureDAO,
                                    PluginStatusCache pluginStatusCache,
                                    EventService eventService) {
        this.deviceInfoDAO = deviceInfoDAO;
        this.settingsDAO = settingsDAO;
        this.unsecureDAO = unsecureDAO;
        this.pluginStatusCache = pluginStatusCache;
        this.eventService = eventService;
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/plugins/deviceinfo/deviceinfo/public/{deviceNumber}")
    public Response saveDeviceInfoLegacy(@PathParam("deviceNumber") String deviceNumber, List<DeviceDynamicInfo> data) {
        return saveDeviceInfoInternal(deviceNumber, data);
    }

    // =================================================================================================================
    @Operation(
            summary = "Save device info",
            description = "Save the Device Info dynamic data"
    )
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/public/plugin-deviceinfo/data/{deviceNumber}")
    public Response saveDeviceInfo(@PathParam("deviceNumber") String deviceNumber, List<DeviceDynamicInfo> data) {
        return saveDeviceInfoInternal(deviceNumber, data);
    }

    private Response saveDeviceInfoInternal(String deviceNumber, List<DeviceDynamicInfo> data) {
        try {
            // Find device and set the device ID for records
            Device dbDevice = this.unsecureDAO.getDeviceByNumber(deviceNumber);
            if (dbDevice == null) {
                logger.error("Device {} was not found", deviceNumber);
                return Response.DEVICE_NOT_FOUND_ERROR();
            }

            SecurityContext.init(dbDevice.getCustomerId());
            try {
                if (this.pluginStatusCache.isPluginDisabled(PLUGIN_ID)) {
                    logger.error("Rejecting request from device {} due to disabled plugin", deviceNumber);
                    return Response.PLUGIN_DISABLED();
                }

                data.forEach(record -> {
                    record.setDeviceId(dbDevice.getId());
                    record.setCustomerId(dbDevice.getCustomerId());
                });

                this.deviceInfoDAO.saveDeviceDynamicData(data);

                // Send locations to the location plugin
                List<DeviceLocation> locations = new LinkedList<>();
                for (DeviceDynamicInfo info : data) {
                    if (info.getGps() != null && info.getGps().getLat() != null && info.getGps().getLon() != null) {
                        DeviceLocation location = new DeviceLocation();
                        location.setLat(info.getGps().getLat());
                        location.setLon(info.getGps().getLon());
                        location.setTs(info.getTs());
                        locations.add(location);
                    }
                }
                if (locations.size() > 0) {
                    this.eventService.fireEvent(
                            new DeviceLocationUpdatedEvent(dbDevice.getId(), locations, true)
                    );
                }

                return Response.OK();
            } finally {
                SecurityContext.release();
            }
        } catch (Exception e) {
            logger.error("Unexpected error when saving device dynamic info", e);
            return Response.INTERNAL_ERROR();
        }
    }

    // =================================================================================================================
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/plugins/deviceinfo/deviceinfo-plugin-settings/device/{deviceNumber}")
    public Response lookupDevicesLegacy(@PathParam("deviceNumber") String deviceNumber) {
        return lookupDevicesInternal(deviceNumber);
    }

    // =================================================================================================================
    @Operation(
            summary = "Get plugin settings by device",
            description = "Gets the plugin settings for usage by device",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = DeviceSettings.class)
                            )
                    )
            }
    )
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/public/plugin-deviceinfo/settings/{deviceNumber}")
    public Response lookupDevices(@PathParam("deviceNumber") String deviceNumber) {
        return lookupDevicesInternal(deviceNumber);
    }

    private Response lookupDevicesInternal(String deviceNumber) {
        try {
            // Find device and set the device ID for records
            Device dbDevice = this.unsecureDAO.getDeviceByNumber(deviceNumber);
            if (dbDevice == null) {
                logger.error("Device {} was not found", deviceNumber);
                return Response.DEVICE_NOT_FOUND_ERROR();
            }

            SecurityContext.init(dbDevice.getCustomerId());
            try {
                if (this.pluginStatusCache.isPluginDisabled(PLUGIN_ID)) {
                    logger.error("Rejecting request from device {} due to disabled plugin", deviceNumber);
                    return Response.PLUGIN_DISABLED();
                }

                final DeviceInfoPluginSettings pluginSettings = this.settingsDAO.getPluginSettings(dbDevice.getCustomerId());

                return Response.OK(new DeviceSettings(pluginSettings));
            } finally {
                SecurityContext.release();
            }
        } catch (Exception e) {
            logger.error("Unexpected error when retrieving device info", e);
            return Response.INTERNAL_ERROR();
        }
    }

}
