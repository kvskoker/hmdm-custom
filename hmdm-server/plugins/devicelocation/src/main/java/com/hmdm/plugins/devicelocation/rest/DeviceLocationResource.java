package com.hmdm.plugins.devicelocation.rest;

import com.hmdm.plugins.devicelocation.persistence.DeviceLocationDAO;
import com.hmdm.plugins.devicelocation.persistence.domain.DeviceLocationSettings;
import com.hmdm.plugins.devicelocation.persistence.domain.LostDevice;
import com.hmdm.rest.json.Response;
import com.hmdm.security.SecurityContext;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;

@Singleton
@Path("/plugins/devicelocation")
@Api(tags = {"Device tracking plugin"})
public class DeviceLocationResource {

    private static final Logger logger = LoggerFactory.getLogger(DeviceLocationResource.class);

    private DeviceLocationDAO dao;

    public DeviceLocationResource() {
    }

    @Inject
    public DeviceLocationResource(DeviceLocationDAO dao) {
        this.dao = dao;
    }

    /**
     * <p>Everything the map needs in one call: the newest position per device, which
     * devices are flagged lost, the tile settings, and how many devices have never
     * reported at all.</p>
     */
    @ApiOperation(value = "Map data", authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/map")
    @Produces(MediaType.APPLICATION_JSON)
    public Response map() {
        try {
            DeviceLocationSettings settings = this.dao.settings();
            int[] coverage = this.dao.coverage();

            Map<String, Object> result = new HashMap<>();
            // Every device, not only those that have reported: a device you have never
            // heard from is exactly the one you want to be able to report lost.
            result.put("points", this.dao.allDevices());
            result.put("lost", this.dao.lostDevices());
            result.put("diagnostics", this.dao.diagnostics());
            result.put("tileUrl", settings.getTileUrl());
            result.put("tileAttribution", settings.getTileAttribution());
            result.put("keepPoints", settings.getKeepPoints());
            result.put("deviceCount", coverage[0]);
            result.put("devicesWithoutLocation", coverage[1]);
            return Response.OK(result);
        } catch (Exception e) {
            logger.error("Failed to build the device location map", e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Location history for one device",
            authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/device/{number}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response history(@PathParam("number") String number,
                            @QueryParam("limit") Integer limit) {
        try {
            Integer deviceId = this.dao.deviceIdByNumber(number);
            if (deviceId == null) {
                return Response.ERROR("plugin.devicelocation.error.device.notfound");
            }
            Map<String, Object> result = new HashMap<>();
            result.put("deviceNumber", number);
            result.put("points", this.dao.pointsForDevice(deviceId, limit == null ? 100 : limit));
            result.put("lost", this.dao.findLost(deviceId));
            DeviceLocationSettings settings = this.dao.settings();
            result.put("tileUrl", settings.getTileUrl());
            result.put("tileAttribution", settings.getTileAttribution());
            return Response.OK(result);
        } catch (Exception e) {
            logger.error("Failed to load location history for " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Report a device lost", authorizations = {@Authorization("Bearer Token")})
    @POST
    @Path("/private/lost/{number}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response reportLost(@PathParam("number") String number, LostDevice request) {
        try {
            if (!SecurityContext.get().hasPermission("plugin_devicelocation_lost")) {
                logger.warn("Unauthorized attempt to report device {} lost", number);
                return Response.PERMISSION_DENIED();
            }
            Integer deviceId = this.dao.deviceIdByNumber(number);
            if (deviceId == null) {
                return Response.ERROR("plugin.devicelocation.error.device.notfound");
            }
            LostDevice lost = this.dao.reportLost(deviceId,
                    request == null ? null : request.getNote());
            return Response.OK(lost);
        } catch (Exception e) {
            logger.error("Failed to report device " + number + " lost", e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Clear the lost flag", authorizations = {@Authorization("Bearer Token")})
    @POST
    @Path("/private/found/{number}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response reportFound(@PathParam("number") String number) {
        try {
            if (!SecurityContext.get().hasPermission("plugin_devicelocation_lost")) {
                logger.warn("Unauthorized attempt to clear the lost flag for {}", number);
                return Response.PERMISSION_DENIED();
            }
            Integer deviceId = this.dao.deviceIdByNumber(number);
            if (deviceId == null) {
                return Response.ERROR("plugin.devicelocation.error.device.notfound");
            }
            this.dao.reportFound(deviceId);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to clear the lost flag for " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Delete a device's location history",
            authorizations = {@Authorization("Bearer Token")})
    @DELETE
    @Path("/private/device/{number}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response clearHistory(@PathParam("number") String number) {
        try {
            if (!SecurityContext.get().hasPermission("plugin_devicelocation_lost")) {
                return Response.PERMISSION_DENIED();
            }
            Integer deviceId = this.dao.deviceIdByNumber(number);
            if (deviceId == null) {
                return Response.ERROR("plugin.devicelocation.error.device.notfound");
            }
            this.dao.clearHistory(deviceId);
            return Response.OK();
        } catch (Exception e) {
            logger.error("Failed to clear location history for " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    /**
     * <p>Whether a device is flagged lost, used by the entry in the device list dropdown so
     * it can offer the right action.</p>
     */
    @ApiOperation(value = "Tracking status of one device",
            authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/status/{number}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response status(@PathParam("number") String number) {
        try {
            Integer deviceId = this.dao.deviceIdByNumber(number);
            if (deviceId == null) {
                return Response.ERROR("plugin.devicelocation.error.device.notfound");
            }
            Map<String, Object> result = new HashMap<>();
            result.put("deviceNumber", number);
            result.put("lost", this.dao.findLost(deviceId));
            result.put("points", this.dao.pointsForDevice(deviceId, 20));
            return Response.OK(result);
        } catch (Exception e) {
            logger.error("Failed to load tracking status for " + number, e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Tracking settings", authorizations = {@Authorization("Bearer Token")})
    @GET
    @Path("/private/settings")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSettings() {
        try {
            return Response.OK(this.dao.settings());
        } catch (Exception e) {
            logger.error("Failed to load tracking settings", e);
            return Response.INTERNAL_ERROR();
        }
    }

    @ApiOperation(value = "Save tracking settings", authorizations = {@Authorization("Bearer Token")})
    @PUT
    @Path("/private/settings")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveSettings(DeviceLocationSettings settings) {
        try {
            if (!SecurityContext.get().hasPermission("plugin_devicelocation_settings")) {
                return Response.PERMISSION_DENIED();
            }
            this.dao.saveSettings(settings);
            return Response.OK(this.dao.settings());
        } catch (Exception e) {
            logger.error("Failed to save tracking settings", e);
            return Response.INTERNAL_ERROR();
        }
    }
}
