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

package com.hmdm.persistence.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * <p>A device alert record stored in <code>Postgres</code> database.</p>
 *
 * @author isv
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Alert implements CustomerData {

    private static final long serialVersionUID = -6331048753317583687L;

    public static final int INFO = 10;
    public static final int WARNING = 20;
    public static final int SEVERE = 30;

    /**
     * <p>An ID of an alert record.</p>
     */
    private Integer id;

    /**
     * <p>An ID of a customer account which the record belongs to.</p>
     */
    private int customerId;


    @Schema(description = "A timestamp of creation of the alert record (in milliseconds since epoch time")
    private Long createTime;

    @Schema(description = "An ID of a device related to alert record (may be empty)")
    private Integer deviceId;

    @Schema(description = "Number of a device related to the alert record (may be empty)")
    private String deviceNumber;

    @Schema(description = "Alert level")
    private int level;

    @Schema(description = "Alert message")
    private String message;

    /**
     * <p>Constructs new <code>Alert</code> instance. This implementation does nothing.</p>
     */
    public Alert() {
    }

    @Override
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @Override
    public int getCustomerId() {
        return customerId;
    }

    @Override
    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public Long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Long createTime) {
        this.createTime = createTime;
    }

    public Integer getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Integer deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceNumber() {
        return deviceNumber;
    }

    public void setDeviceNumber(String deviceNumber) {
        this.deviceNumber = deviceNumber;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

