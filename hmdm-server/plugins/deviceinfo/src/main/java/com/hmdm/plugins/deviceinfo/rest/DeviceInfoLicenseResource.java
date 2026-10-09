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

import com.hmdm.event.EventService;
import com.hmdm.persistence.DeviceDAO;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Device;
import com.hmdm.plugin.rest.json.LicenseResponse;
import com.hmdm.plugin.service.PluginStatusCache;
import com.hmdm.plugins.deviceinfo.persistence.DeviceInfoDAO;
import com.hmdm.plugins.deviceinfo.rest.json.DeviceDynamicInfoRecord;
import com.hmdm.plugins.deviceinfo.rest.json.DeviceInfo;
import com.hmdm.plugins.deviceinfo.rest.json.DynamicInfoExportFilter;
import com.hmdm.plugins.deviceinfo.rest.json.DynamicInfoFilter;
import com.hmdm.plugins.deviceinfo.service.DeviceInfoExportService;
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
import java.util.List;

/**
 * <p>A resource to be used for checking the license for the  <code>Device Info</code> plugin.</p>
 *
 * @author isv
 */
@Singleton
@Path("/private/plugin-deviceinfo/license")
@Tag(name = "Device Info plugin license")
public class DeviceInfoLicenseResource {

    /**
     * <p>Constructs new <code>DeviceInfoLicenseResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public DeviceInfoLicenseResource() {
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
    @Produces(MediaType.APPLICATION_JSON)
    public Response license() {
        return Response.OK(LicenseResponse.genericValidResponse());
    }

}
