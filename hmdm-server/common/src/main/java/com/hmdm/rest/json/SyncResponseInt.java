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

package com.hmdm.rest.json;

import com.hmdm.persistence.domain.Application;
import com.hmdm.persistence.domain.ConfigurationFile;

import java.util.List;

/**
 * <p>An interface for the response sent to device in response to request for configuration synchronization.</p>
 *
 * @author isv
 */
public interface SyncResponseInt {

    String getBackgroundColor();

    String getTextColor();

    String getBackgroundImageUrl();

    List<SyncApplicationInt> getApplications();

    String getPassword();

    String getImei();

    String getPhone();

    String getIconSize();

    String getTitle();

    Boolean getGps();

    Boolean getBluetooth();

    Boolean getWifi();

    Boolean getMobileData();

    boolean isKioskMode();

    Boolean getKioskHome();

    Boolean getKioskRecents();

    Boolean getKioskNotifications();

    Boolean getKioskSystemInfo();

    Boolean getKioskKeyguard();

    Boolean getKioskLockButtons();

    Boolean getKioskScreenOn();

    String getMainApp();

    boolean isLockStatusBar();

    int getSystemUpdateType();

    String getSystemUpdateFrom();

    String getSystemUpdateTo();

    Boolean getScheduleAppUpdate();

    String getAppUpdateFrom();

    String getAppUpdateTo();

    String getDownloadUpdates();

    List<SyncApplicationSettingInt> getApplicationSettings();

    Boolean getUsbStorage();

    String getRequestUpdates();

    Boolean getDisableLocation();

    String getAppPermissions();

    String getPushOptions();

    Integer getKeepaliveTime();

    Boolean getAutoBrightness();

    Integer getBrightness();

    Boolean getManageTimeout();

    Integer getTimeout();

    Boolean getLockVolume();

    Boolean getManageVolume();

    Integer getVolume();

    String getPasswordMode();

    Integer getOrientation();

    Boolean getDisplayStatus();

    Boolean getRunDefaultLauncher();

    Boolean getDisableScreenshots();

    Boolean getAutostartForeground();

    String getTimeZone();

    String getAllowedClasses();

    String getNewServerUrl();

    Boolean getLockSafeSettings();

    Boolean getPermissive();

    Boolean getKioskExit();

    Boolean getShowWifi();

    List<SyncConfigurationFileInt> getFiles();

    String getNewNumber();

    String getRestrictions();

    String getCustom1();

    String getCustom2();

    String getCustom3();

    String getAppName();

    String getVendor();

    String getDescription();

    // ---------------------------------------------------------------------------------
    // Setters added by this fork so plugins can shape the sync response.
    //
    // The interface lives in the common module and SyncResponse lives in the server
    // module, which plugins cannot depend on. Declaring these as default no-ops here is
    // what lets a plugin address a single device without the core knowing why.
    // ---------------------------------------------------------------------------------

    /** Turns location collection on or off for this device. See RequestUpdatesType. */
    default void setRequestUpdates(String requestUpdates) {
    }

    /** Whether the launcher should withhold the location permission. */
    default void setDisableLocation(Boolean disableLocation) {
    }

    /**
     * <p>A new lock screen password for the device, or null. Declared here rather
     * than only on SyncResponse so plugins - which depend on common but cannot
     * depend on server - can set it from a SyncResponseHook.</p>
     */
    default String getPasswordReset() {
        return null;
    }

    default void setPasswordReset(String passwordReset) {
    }

    /**
     * <p>When true, the launcher confirms to the server and then reboots the device.
     * Declared here so plugins can set it from a SyncResponseHook.</p>
     */
    default Boolean getReboot() {
        return null;
    }

    default void setReboot(Boolean reboot) {
    }

    /**
     * <p>When true, the launcher confirms to the server and then wipes the device.
     * Irreversible.</p>
     */
    default Boolean getFactoryReset() {
        return null;
    }

    default void setFactoryReset(Boolean factoryReset) {
    }

    /**
     * <p>Lock state, not a one-shot command: while true the launcher shows a
     * full-screen lock with {@link #getLockMessage()}. Set it back to false to
     * release the device.</p>
     */
    default Boolean getLock() {
        return null;
    }

    default void setLock(Boolean lock) {
    }

    default String getLockMessage() {
        return null;
    }

    default void setLockMessage(String lockMessage) {
    }

    /**
     * <p>Tells the device to adopt a different number as its identity. The core server
     * uses this for IMEI-matched re-enrolment; the deviceenroll plugin uses it to hand
     * a freshly enrolled device its allocated number.</p>
     */
    default void setNewNumber(String newNumber) {
    }
}
