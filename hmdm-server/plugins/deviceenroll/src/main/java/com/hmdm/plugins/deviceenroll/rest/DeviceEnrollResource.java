package com.hmdm.plugins.deviceenroll.rest;

import com.hmdm.plugins.deviceenroll.persistence.DeviceEnrollDAO;
import com.hmdm.plugins.deviceenroll.persistence.domain.NumberingRule;
import com.hmdm.rest.json.Response;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

@Singleton
@Path("/plugins/deviceenroll")
@Api(tags = {"Device enrollment plugin"})
public class DeviceEnrollResource {

    private static final Logger logger = LoggerFactory.getLogger(DeviceEnrollResource.class);

    private DeviceEnrollDAO dao;

    public DeviceEnrollResource() {
    }

    @Inject
    public DeviceEnrollResource(DeviceEnrollDAO dao) {
        this.dao = dao;
    }

    @ApiOperation(value = "Numbering rules", authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/rules")
    @Produces(MediaType.APPLICATION_JSON)
    public Response rules() {
        try {
            return Response.OK(this.dao.rules());
        } catch (Exception e) {
            logger.error("Failed to load numbering rules", e);
            return Response.INTERNAL_ERROR();
        }
    }

    /**
     * <p>Creates or updates the rule for a group.</p>
     *
     * @param groupName names a group to create when the rule carries no group id, so an
     *                  administrator can add a location without visiting the Groups page.
     * @param overwrite set when the panel has asked the user to confirm replacing a rule
     *                  the group already has.
     */
    @ApiOperation(value = "Save a numbering rule", authorizations = {@Authorization("Bearer Token")})
    @POST
    @Path("/private/rules")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveRule(NumberingRule rule,
                             @QueryParam("groupName") String groupName,
                             @QueryParam("overwrite") Boolean overwrite) {
        try {
            if (rule == null) {
                return Response.ERROR("plugin.deviceenroll.error.prefix.required");
            }
            return Response.OK(
                    this.dao.saveRule(rule, groupName, Boolean.TRUE.equals(overwrite)));
        } catch (DeviceEnrollDAO.RuleException e) {
            // The message is a localization key, so the panel can say what went wrong.
            logger.warn("Could not save numbering rule {}: {}", rule, e.getMessage());
            return Response.ERROR(e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to save numbering rule " + rule, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Delete a numbering rule", authorizations = {@Authorization("Bearer Token")})
    @DELETE
    @Path("/private/rules/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteRule(@PathParam("id") int id) {
        try {
            this.dao.deleteRule(id);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to delete numbering rule " + id, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Numbers handed out", authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/assignments")
    @Produces(MediaType.APPLICATION_JSON)
    public Response assignments() {
        try {
            return Response.OK(this.dao.assignments());
        } catch (Exception e) {
            logger.error("Failed to load assignments", e);
            return Response.INTERNAL_ERROR();
        }
    }
}
