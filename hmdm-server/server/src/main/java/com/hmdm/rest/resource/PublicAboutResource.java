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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdm.persistence.CustomerDAO;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Application;
import com.hmdm.persistence.domain.ApplicationType;
import com.hmdm.persistence.domain.Customer;
import com.hmdm.persistence.domain.Device;
import com.hmdm.rest.json.AboutResponse;
import com.hmdm.rest.json.Response;
import com.hmdm.rest.json.UploadAppRequest;
import com.hmdm.util.CryptoUtil;
import com.hmdm.util.FileUtil;
import com.hmdm.util.StringUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import static com.hmdm.util.FileUtil.writeToFile;

/**
 * <p>A publicly available API which does not require authentication/authorization.</p>
 *
 * @author isv
 */
@Singleton
@Path("/public/about")
@Tag(name = "App version information")
public class PublicAboutResource {

    private static final Logger logger  = LoggerFactory.getLogger(PublicAboutResource.class);

    private String baseUrl;

    /**
     * <p>A constructor required by Swagger.</p>
     */
    public PublicAboutResource() {
    }

    /**
     * <p>Constructs new <code>PublicAboutResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public PublicAboutResource(@Named("base.url") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    // =================================================================================================================
    @Operation(
            summary = "Returns the app information",
            description = "This method is used by the front-end to display the version and update front-end if required"
    )
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response about() {
        AboutResponse response = new AboutResponse();
        response.setVersion(getVersion());
        return Response.OK(response);
    }

    public String getVersion() {
        Properties props = new Properties();
        try (InputStream in = getClass()
                .getClassLoader()
                .getResourceAsStream("app.properties")) {
            props.load(in);
        } catch (IOException e) {
            return null;
        }
        return props.getProperty("app.version");
    }
}
