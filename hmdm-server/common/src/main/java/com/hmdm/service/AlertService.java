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

package com.hmdm.service;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.persistence.domain.Alert;
import jakarta.inject.Named;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * <p>A service to send alerts to the main module.</p>
 *
 * @author isv
 */
@Singleton
public class AlertService {

    private final String internalUrl;
    private String errorReason;

    @Inject
    public AlertService(@Named("internal.url") String internalUrl) {
        this.internalUrl = internalUrl;
    }

    public boolean sendAlert(Alert alert) {
        Client client = ClientBuilder.newClient();

        try {
            Response response = client.target(internalUrl + "/rest/internal/alert")
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.entity(alert, MediaType.APPLICATION_JSON));
            if (response.getStatus() != Response.Status.OK.getStatusCode()) {
                errorReason = "Wrong HTTP response: " + response.getStatus();
                return false;
            }
            com.hmdm.rest.json.Response jsonResponse = response.readEntity(com.hmdm.rest.json.Response.class);
            if (!com.hmdm.rest.json.Response.ResponseStatus.OK.equals(jsonResponse.getStatus())) {
                errorReason = "Failed to execute the API call";
                return false;
            }
            errorReason = null;
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            Throwable cause = e.getCause();

            if (cause instanceof java.net.UnknownHostException) {
                errorReason = "DNS lookup failed";
            } else if (cause instanceof java.net.ConnectException) {
                errorReason = "Connection refused";
            } else if (cause instanceof java.net.SocketTimeoutException) {
                errorReason = "Connection timeout";
            } else {
                errorReason = "Connection error: " + e.getMessage();
            }
            return false;
        }
    }
}
