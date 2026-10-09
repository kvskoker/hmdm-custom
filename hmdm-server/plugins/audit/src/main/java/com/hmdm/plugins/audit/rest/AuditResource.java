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

package com.hmdm.plugins.audit.rest;

import com.hmdm.plugin.rest.json.LicenseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import com.hmdm.plugins.audit.persistence.AuditDAO;
import com.hmdm.plugins.audit.persistence.domain.AuditLogRecord;
import com.hmdm.plugins.audit.rest.json.AuditLogFilter;
import com.hmdm.rest.json.PaginatedData;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import jakarta.ws.rs.GET;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/**
 * <p>A resource to be used for accessing the data for <code>Audit</code> log records.</p>
 *
 * @author isv
 */
@Singleton
@Path("/private/plugin-audit")
@Tag(name = "Audit")
public class AuditResource {

    private static final Logger logger = LoggerFactory.getLogger(AuditResource.class);

    private AuditDAO auditDAO;

    /**
     * <p>A constructor required by Swagger.</p>
     */
    public AuditResource() {
    }

    /**
     * <p>Constructs new <code>AuditResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public AuditResource(AuditDAO auditDAO) {
        this.auditDAO = auditDAO;
    }

    /**
     * <p>Gets the list of audit log records matching the specified filter.</p>
     *
     * @param filter a filter to be used for filtering the records.
     * @return a response with list of audit log records matching the specified filter.
     */
    @Operation(
            summary = "Search logs",
            description = "Gets the list of audit log records matching the specified filter",
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
    public Response getLogs(AuditLogFilter filter) {
        if (!SecurityContext.get().hasPermission("plugin_audit_access")) {
            logger.error("Unauthorized attempt to get the audit log by user " +
                    SecurityContext.get().getCurrentUserName());
            return Response.PERMISSION_DENIED();
        }
        try {
            List<AuditLogRecord> records = this.auditDAO.findAll(filter);
            long count = this.auditDAO.countAll(filter);

            return Response.OK(new PaginatedData<>(records, count));
        } catch (Exception e) {
            logger.error("Failed to search the audit log records due to unexpected error. Filter: {}", filter, e);
            return Response.INTERNAL_ERROR();
        }
    }

    /**
     * <p>Checks for valid license for a plugin</p>
     *
     * @return {@link LicenseResponse} indicating whether the license is valid .
     */
    @Operation(
            summary = "Checks for a plugin license",
            description = "Checks for valid license for a plugin",
            security = @SecurityRequirement(name = "Bearer Token"),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "OK",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LicenseResponse.class)
                            )
                    )
            }
    )
    @GET
    @Path("/license")
    @Produces(MediaType.APPLICATION_JSON)
    public Response license() {
        return Response.OK(LicenseResponse.genericValidResponse());
    }

}
