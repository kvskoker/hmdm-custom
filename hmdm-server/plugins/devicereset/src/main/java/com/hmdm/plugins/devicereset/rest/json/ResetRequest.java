package com.hmdm.plugins.devicereset.rest.json;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ResetRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "Number of the device whose PIN should be reset")
    private String deviceNumber;

    @Schema(description = "Length of the generated PIN (4-16, default 6)")
    private Integer pinLength;

    public String getDeviceNumber() { return deviceNumber; }
    public void setDeviceNumber(String deviceNumber) { this.deviceNumber = deviceNumber; }

    @Schema(description = "For factory reset: the device number retyped by the admin, as a guardrail")
    private String confirmDeviceNumber;

    @Schema(description = "Message shown on the device lock screen")
    private String message;

    public String getConfirmDeviceNumber() { return confirmDeviceNumber; }
    public void setConfirmDeviceNumber(String confirmDeviceNumber) {
        this.confirmDeviceNumber = confirmDeviceNumber;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Integer getPinLength() { return pinLength; }
    public void setPinLength(Integer pinLength) { this.pinLength = pinLength; }
}
