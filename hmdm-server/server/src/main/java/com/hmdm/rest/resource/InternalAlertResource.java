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
import com.hmdm.persistence.domain.Device;
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
 * <p>A resource to be used for sending <code>Alerts</code> by other modules / WARs.</p>
 *
 * @author seva
 */
@Tag(name = "Send an alert")
@Singleton
@Path("/internal/alert")
public class InternalAlertResource {

    // A logging service
    private static final Logger logger  = LoggerFactory.getLogger(InternalAlertResource.class);

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
    public InternalAlertResource() {
        // Empty
    }

    /**
     * <p>Constructs new <code>AlertResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public InternalAlertResource(AlertDAO alertDAO,
                                 UnsecureDAO unsecureDAO) {
        this.alertDAO = alertDAO;
        this.unsecureDAO = unsecureDAO;
    }

    /**
     * <p>Triggers an alert.</p>
     *
     * @param alert an alert to be sent
     * @return OK on success or error if something goes wrong
     */
    @Operation(
            summary = "Trigger an alert",
            description = "Gets the list of alert records matching the specified filter",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK"
                    )
            }
    )
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public Response triggerAlert(Alert alert) {
        // This is an internal method available on localhost only, so no permission checks
        try {
            alert.setCreateTime(System.currentTimeMillis());
            if (alert.getDeviceId() != null) {
                Device device = unsecureDAO.getDeviceById(alert.getDeviceId());
                if (device != null) {
                    alert.setDeviceNumber(device.getNumber());
                } else {
                    alert.setDeviceId(null);
                }
            }
            // The sender is responsible to set a correct customer ID, so do nothing here
            alertDAO.insertRecord(alert);
            AlertWebsocketEndpoint.publish(alert);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to trigger an alert due to unexpected error. Alert: {}", alert, e);
            return Response.INTERNAL_ERROR();
        }
    }
}
