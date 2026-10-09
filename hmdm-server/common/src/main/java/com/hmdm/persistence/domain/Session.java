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
import com.hmdm.util.SerializationUtil;

import java.io.IOException;
import java.io.Serializable;

/**
 * <p>Database representation of the session storage for sharing the session among multiple WAR applications</p>
 *
 * @author isv
 */
@Schema(description = "Database representation of the session storage")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Session implements Serializable {

    private static final long serialVersionUID = -5082987201749962822L;
    @Schema(description = "Session creation date/time")
    private Long created;
    @Schema(description = "Last access date/time")
    private Long accessed;
    @Schema(description = "Unique identifier of the session")
    private String sessionId;
    @Schema(description = "User representation")
    private String userData;
    @Schema(description = "Two-factor authentication requirement flag")
    private boolean twoFactorNeeded;

    /**
     * <p>Constructs new <code>Session</code> instance. This implementation does nothing.</p>
     */
    public Session() {
    }

    public Long getCreated() {
        return created;
    }

    public void setCreated(Long created) {
        this.created = created;
    }

    public Long getAccessed() {
        return accessed;
    }

    public void setAccessed(Long accessed) {
        this.accessed = accessed;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserData() {
        return userData;
    }

    public void setUserData(String userData) {
        this.userData = userData;
    }

    public void setUser(User user) {
        try {
            this.userData = SerializationUtil.serializeToString(user);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public User getUser() {
        try {
            return SerializationUtil.deserializeFromString(this.userData, User.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTwoFactorNeeded() {
        return twoFactorNeeded;
    }

    public void setTwoFactorNeeded(boolean twoFactorNeeded) {
        this.twoFactorNeeded = twoFactorNeeded;
    }

    @Override
    public String toString() {
        return "Session {" +
                "sessionId='" + sessionId + '\'' +
                ", created=" + created +
                ", accessed=" + accessed +
                ", userData='" + userData + '\'' +
                ", twoFactorNeeded=" + twoFactorNeeded +
                '}';
    }
}
