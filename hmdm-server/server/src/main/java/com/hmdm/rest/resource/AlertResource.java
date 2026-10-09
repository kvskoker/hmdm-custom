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

package com.hmdm.rest.resource;

import com.hmdm.persistence.AlertDAO;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Alert;
import com.hmdm.plugin.service.PluginStatusCache;
import com.hmdm.rest.json.AlertFilter;
import com.hmdm.rest.json.PaginatedData;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
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

/**
 * <p>A resource to be used for accessing the data for <code>Alert</code> records.</p>
 *
 * @author isv
 */
@Tag(name = "Manage alert")
@Singleton
@Path("/private/alert")
public class AlertResource {

    // A logging service
    private static final Logger logger  = LoggerFactory.getLogger(AlertResource.class);

    // An executor for the log records upload tasks
    private final ExecutorService executor = Executors.newFixedThreadPool(5);

    /**
     * <p>An interface to alert records persistence layer.</p>
     */
    private AlertDAO alertDAO;

    /**
     * <p>An interface to persistence without security checks.</p>
     */
    private UnsecureDAO unsecureDAO;

    /**
     * <p>A constructor required by Swagger.</p>
     */
    public AlertResource() {
        // Empty
    }

    /**
     * <p>Constructs new <code>AlertResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public AlertResource(AlertDAO alertDAO,
                         UnsecureDAO unsecureDAO) {
        this.alertDAO = alertDAO;
        this.unsecureDAO = unsecureDAO;
    }

    /**
     * <p>Gets the list of alert records matching the specified filter.</p>
     *
     * @param filter a filter to be used for filtering the records.
     * @return a response with list of device log records matching the specified filter.
     */
    @Operation(
            summary = "Search alerts",
            description = "Gets the list of alert records matching the specified filter",
            security = @SecurityRequirement(name = "Bearer Token"),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedData.class)
                            )
                    )
            }
    )
    @POST
    @Path("/search")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAlerts(AlertFilter filter) {
        if (!SecurityContext.get().hasPermission("alerts")) {
            logger.error("Unauthorized attempt to get alerts by user " +
                    SecurityContext.get().getCurrentUserName());
            return Response.PERMISSION_DENIED();
        }
        try {
            List<Alert> records = this.alertDAO.findAll(filter);
            long count = this.alertDAO.countAll(filter);

            return Response.OK(new PaginatedData<>(records, count));
        } catch (Exception e) {
            logger.error("Failed to search alert records due to unexpected error. Filter: {}", filter, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @Operation(
            summary = "Exports alerts",
            description = "Export the list of alert records matching the specified filter",
            security = @SecurityRequirement(name = "Bearer Token"),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK",
                            headers = {
                                    @Header(name = "Content-Type", description = "Content type of the exported data")
                            }
                    )
            }
    )
    @POST
    @Path("/export")
    @Produces(MediaType.APPLICATION_JSON)
    public jakarta.ws.rs.core.Response exportAlerts(AlertFilter filter) {
        if (!SecurityContext.get().hasPermission("alerts")) {
            logger.error("Unauthorized attempt to export alerts by user " +
                    SecurityContext.get().getCurrentUserName());
            return jakarta.ws.rs.core.Response.serverError().status(403).build();
        }

        filter.setPageNum(1);
        filter.setExport(true);

        ContentDisposition contentDisposition = ContentDisposition.type("attachment").fileName("alerts.csv").creationDate(new Date()).build();

        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss.SSS");

        AtomicBoolean stop = new AtomicBoolean(false);


        return jakarta.ws.rs.core.Response.ok( (StreamingOutput) output -> {
            try {
                List<Alert> records = this.alertDAO.findAll(filter);
                while (!stop.get() && !records.isEmpty()) {
                    records.forEach(alert -> {
                        StringBuilder b = new StringBuilder();
                        b.append(dateFormat.format(new Date(alert.getCreateTime())));
                        b.append(",");
                        b.append(alert.getDeviceNumber());
                        b.append(",");
                        b.append(alert.getLevel());
                        b.append(",");
                        b.append(alert.getMessage());
                        b.append('\n');

                        try {
                            output.write(b.toString().getBytes());
                        } catch (IOException e) {
                            logger.error("Failed to write alert record {} to output stream. Stopping to export the " +
                                    "further log records.", alert, e);
                            stop.set(true);
                        }
                    });

                    output.flush();

                    if (!stop.get()) {
                        filter.setPageNum(filter.getPageNum() + 1);
                        records = this.alertDAO.findAll(filter);
                    }
                }

                output.flush();
            } catch ( Exception e ) {
                logger.error("Failed to export the alert records due to unexpected error. Filter: {}", filter, e);
            }
        } )
                .header("Cache-Control", "no-cache")
                .header( "Content-Type", "text/plain" )
                .header( "Content-Disposition", contentDisposition )
                .build();
    }
}
