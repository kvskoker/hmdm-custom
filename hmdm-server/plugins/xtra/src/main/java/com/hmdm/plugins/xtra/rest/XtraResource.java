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

package com.hmdm.plugins.xtra.rest;

import com.hmdm.plugin.rest.json.LicenseResponse;
import com.hmdm.rest.json.Response;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>A resource to be used for managing the <code>Xtra</code> plugin data</p>
 *
 * @author isv
 */
@Singleton
@Path("/private/plugin-xtra")
@Tag(name = "Request Premium Trial plugin methods")
public class XtraResource {

    private static final Logger logger = LoggerFactory.getLogger(XtraResource.class);

    /**
     * <p>Constructs new <code>XtraResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public XtraResource() {
    }

    @Operation(
            summary = "Get the main license data",
            description = "Return the key validity, remaining days, and purchase link."
    )
    @GET
    @Path("/license")
    @Produces(MediaType.APPLICATION_JSON)
    public Response license() {
        return Response.OK(LicenseResponse.genericValidResponse());
    }

}
