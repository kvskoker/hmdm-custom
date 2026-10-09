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

package com.hmdm.plugins.messaging.rest;

import com.hmdm.notification.PushService;
import com.hmdm.notification.persistence.domain.PushMessage;
import com.hmdm.persistence.DeviceDAO;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Device;
import com.hmdm.persistence.domain.DeviceSearchRequest;
import com.hmdm.plugin.service.PluginStatusCache;
import com.hmdm.plugins.messaging.persistence.MessagingDAO;
import com.hmdm.plugins.messaging.persistence.domain.Message;
import com.hmdm.plugins.messaging.rest.json.MessageFilter;
import com.hmdm.plugins.messaging.rest.json.SendRequest;
import com.hmdm.rest.json.PaginatedData;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import com.hmdm.security.SecurityException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedList;
import java.util.List;

/**
 * <p>A resource to be used for managing the <code>Messaging</code> plugin data for customer account associated
 * with current user.</p>
 *
 * @author isv
 */
@Singleton
@Path("/public/plugin-messaging")
@Tag(name = "Messaging plugin public methods")
public class MessagingPublicResource {

    private static final Logger logger = LoggerFactory.getLogger(MessagingPublicResource.class);

    /**
     * <p>An interface to message records persistence.</p>
     */
    private MessagingDAO messagingDAO;

    /**
     * <p>A constructor required by swagger.</p>
     */
    public MessagingPublicResource() {
    }

    /**
     * <p>Constructs new <code>MessagingResource</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public MessagingPublicResource(MessagingDAO messagingDAO) {
        this.messagingDAO = messagingDAO;
    }

    // =================================================================================================================
    @Operation(
            summary = "Sets the message status",
            description = "Marks message as delivered or read."
    )
    @GET
    @Path("/status/{id}/{status}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response setMessageStatus(@PathParam("id") Integer id, @PathParam("status") Integer status) {
        if (status == null || status < 0 || status > Message.STATUS_READ) {
            logger.error("Wrong status " + status + " for message id " + id);
            return Response.ERROR();
        }
        try {
            this.messagingDAO.updateMessageStatus(id, status);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Unexpected error when marking the message " + id + " as read", e);
            return Response.ERROR();
        }
    }
}
