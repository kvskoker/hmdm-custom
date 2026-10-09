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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.inject.Named;

import com.hmdm.rest.json.NameResponse;
import org.apache.poi.util.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hmdm.rest.json.Response;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.StreamingOutput;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

import static com.hmdm.util.FileUtil.writeToFile;

/**
 * <p>A publicly available API which does not require authentication/authorization.</p>
 *
 * @author isv
 */
@Singleton
@Path("/public/brand")
@Tag(name = "Mobile client API")
public class BrandResource {

    private static final Logger logger  = LoggerFactory.getLogger(BrandResource.class);

    private String appName;
    private String appLogo;
    private String appVendorName;
    private String appVendorLink;
    private String appSignupLink;
    private String appTermsLink;
    private String legacyUrlLink;

    /**
     * <p>A constructor required by Swagger.</p>
     */
    public BrandResource() {
    }

    /**
     * <p>Constructs new <code>PublicResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public BrandResource(@Named("rebranding.name") String appName,
                         @Named("rebranding.logo") String appLogo,
                         @Named("rebranding.vendor.name") String appVendorName,
                         @Named("rebranding.vendor.link") String appVendorLink,
                         @Named("rebranding.signup.link") String appSignupLink,
                         @Named("rebranding.terms.link") String appTermsLink,
                         @Named("legacy.url.link") String legacyUrlLink) {
        this.appName = appName;
        this.appLogo = appLogo;
        this.appVendorName = appVendorName;
        this.appVendorLink = appVendorLink;
        this.appSignupLink = appSignupLink;
        this.appTermsLink = appTermsLink;
        this.legacyUrlLink = legacyUrlLink;
    }

    // =================================================================================================================
    @Operation(
            summary = "Get name and vendor",
            description = "Gets the application name and vendor for rebranding purposes."
    )
    @GET
    @Path("/name")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRebranding() {
        NameResponse nameResponse = new NameResponse();
        nameResponse.setAppName(appName);
        nameResponse.setVendorName(appVendorName);
        nameResponse.setVendorLink(appVendorLink);
        nameResponse.setSignupLink(appSignupLink);
        nameResponse.setTermsLink(appTermsLink);
        if (legacyUrlLink != null && !legacyUrlLink.isEmpty()) {
            nameResponse.setLegacyUrl(legacyUrlLink);
        }
        return Response.OK(nameResponse);
    }

    // =================================================================================================================
    @Operation(
            summary = "Get logo",
            description = "Returns the rebranded logo."
    )
    @GET
    @Path("/logo")
    @Produces(MediaType.APPLICATION_JSON)
    public jakarta.ws.rs.core.Response getRebrandedLogo() {
        try {
            if (!appLogo.equals("")) {
                File file = new File(appLogo);
                if (file.exists()) {
                    InputStream input = new FileInputStream(file);

                    return jakarta.ws.rs.core.Response.ok( (StreamingOutput) output -> {
                        IOUtils.copy(input, output);
                    } )
                            .header("Cache-Control", "no-cache")
                            .header( "Content-Type", "image/png" ).build();
                } else {
                    System.out.println("Not found: " + file.getAbsolutePath());
                    return jakarta.ws.rs.core.Response.status(jakarta.ws.rs.core.Response.Status.NOT_FOUND).build();
                }
            } else {
                return jakarta.ws.rs.core.Response.temporaryRedirect(new URI("../images/logo.png")).build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return jakarta.ws.rs.core.Response.serverError().build();
        }
    }
}
