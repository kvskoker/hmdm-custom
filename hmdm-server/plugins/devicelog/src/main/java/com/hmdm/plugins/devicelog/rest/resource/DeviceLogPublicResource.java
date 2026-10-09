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

package com.hmdm.plugins.devicelog.rest.resource;

import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Device;
import com.hmdm.plugin.service.PluginStatusCache;
import com.hmdm.plugins.devicelog.model.DeviceLogRecord;
import com.hmdm.plugins.devicelog.persistence.DeviceLogDAO;
import com.hmdm.plugins.devicelog.rest.json.AppliedDeviceLogRule;
import com.hmdm.plugins.devicelog.rest.json.DeviceLogFilter;
import com.hmdm.plugins.devicelog.rest.json.UploadedDeviceLogRecord;
import com.hmdm.plugins.devicelog.task.InsertDeviceLogRecordsTask;
import com.hmdm.rest.json.PaginatedData;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.StreamingOutput;
import org.glassfish.jersey.media.multipart.ContentDisposition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

import static com.hmdm.plugins.devicelog.DeviceLogPluginConfigurationImpl.PLUGIN_ID;

/**
 * <p>A resource to be used for accessing the data for <code>Device Log</code> records.</p>
 *
 * @author isv
 */
@Tag(name = "Device log plugin")
// Full path is specified for each method for backward compatibility
//@Path("/public/plugin-devicelog")
@Path("/")
@Singleton
public class DeviceLogPublicResource {

    // A logging service
    private static final Logger logger  = LoggerFactory.getLogger(DeviceLogPublicResource.class);

    // An executor for the log records upload tasks
    private final ExecutorService executor = Executors.newFixedThreadPool(5);

    /**
     * <p>An interface to device log records persistence layer.</p>
     */
    private DeviceLogDAO deviceLogDAO;

    private PluginStatusCache pluginStatusCache;

    /**
     * <p>An interface to persistence without security checks.</p>
     */
    private UnsecureDAO unsecureDAO;

    /**
     * <p>A constructor required by Swagger.</p>
     */
    public DeviceLogPublicResource() {
        // Empty
    }

    /**
     * <p>Constructs new <code>DeviceLogResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public DeviceLogPublicResource(DeviceLogDAO deviceLogDAO,
                                   PluginStatusCache pluginStatusCache,
                                   UnsecureDAO unsecureDAO) {
        this.deviceLogDAO = deviceLogDAO;
        this.pluginStatusCache = pluginStatusCache;
        this.unsecureDAO = unsecureDAO;
    }

    // Old URL for backward compatibility
    @POST
    @Path("/plugins/devicelog/log/list/{deviceNumber}")
    public Response uploadLogsLegacy(@PathParam("deviceNumber") String deviceNumber,
                               List<UploadedDeviceLogRecord> logs,
                               @Context HttpServletRequest httpRequest) {
        return uploadLogsInternal(deviceNumber, logs, httpRequest);
    }

    // New URL format convention
    @Operation(
            summary = "Upload logs",
            description = "Uploads the list of log records from device to server",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Response.class)
                            )
                    )
            }
    )
    @POST
    @Path("/public/plugin-devicelog/list/{deviceNumber}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadLogs(@PathParam("deviceNumber") String deviceNumber,
                               List<UploadedDeviceLogRecord> logs,
                               @Context HttpServletRequest httpRequest) {
        return uploadLogsInternal(deviceNumber, logs, httpRequest);
    }

    private Response uploadLogsInternal(String deviceNumber,
                List<UploadedDeviceLogRecord> logs,
                @Context HttpServletRequest httpRequest) {
        logger.debug("#uploadLogs: {} => {}", deviceNumber, logs);
        try {
            final Device dbDevice = this.unsecureDAO.getDeviceByNumber(deviceNumber);
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

                this.executor.submit(
                        new InsertDeviceLogRecordsTask(deviceNumber, httpRequest.getRemoteAddr(), logs, this.deviceLogDAO)
                );
                return Response.OK();
            } finally {
                SecurityContext.release();
            }
        } catch (Exception e) {
            logger.error("Unexpected error when handling uploaded log records", e);
            return Response.INTERNAL_ERROR();
        }
    }

    @GET
    @Path("/plugins/devicelog/log/rules/{deviceNumber}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDeviceLogRulesLegacy(@PathParam("deviceNumber") String deviceNumber) {
        return getDeviceLogRulesInternal(deviceNumber);
    }

    @Operation(
            summary = "Get log rules",
            description = "Gets the list of log rules for device",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(
                                            schema = @Schema(implementation = AppliedDeviceLogRule.class)
                                    )
                            )
                    )
            }
    )
    @GET
    @Path("/public/plugin-devicelog/rules/{deviceNumber}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDeviceLogRules(@PathParam("deviceNumber") String deviceNumber) {
        return getDeviceLogRulesInternal(deviceNumber);
    }

    private Response getDeviceLogRulesInternal(String deviceNumber) {
        try {
            final Device dbDevice = this.unsecureDAO.getDeviceByNumber(deviceNumber);
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

                final List<AppliedDeviceLogRule> deviceLogRules = this.deviceLogDAO.getDeviceLogRules(deviceNumber);
                logger.debug("#getDeviceLogRules: {} => {}", deviceNumber, deviceLogRules);
                return Response.OK(deviceLogRules);
            } finally {
                SecurityContext.release();
            }
        } catch (Exception e) {
            logger.error("Unexpected error when handling request for device log rules", e);
            return Response.INTERNAL_ERROR();
        }
    }

}
