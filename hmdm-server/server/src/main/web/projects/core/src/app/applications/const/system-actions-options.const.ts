import { TOption } from 'hmdm-ui-kit';

export const SYSTEM_ACTIONS_OPTIONS: TOption<string>[] = [
  // Phone actions
  { value: 'android.intent.action.DIAL', viewValue: 'android.intent.action.DIAL' },

  // Accessibility settings
  {
    value: 'android.settings.ACCESSIBILITY_SETTINGS',
    viewValue: 'android.settings.ACCESSIBILITY_SETTINGS',
  },

  // Network settings
  {
    value: 'android.settings.AIRPLANE_MODE_SETTINGS',
    viewValue: 'android.settings.AIRPLANE_MODE_SETTINGS',
  },
  { value: 'android.settings.APN_SETTINGS', viewValue: 'android.settings.APN_SETTINGS' },
  {
    value: 'android.settings.BLUETOOTH_SETTINGS',
    viewValue: 'android.settings.BLUETOOTH_SETTINGS',
  },
  { value: 'android.settings.CAST_SETTINGS', viewValue: 'android.settings.CAST_SETTINGS' },
  {
    value: 'android.settings.DATA_ROAMING_SETTINGS',
    viewValue: 'android.settings.DATA_ROAMING_SETTINGS',
  },
  {
    value: 'android.settings.DATA_USAGE_SETTINGS',
    viewValue: 'android.settings.DATA_USAGE_SETTINGS',
  },
  {
    value: 'android.settings.NETWORK_OPERATOR_SETTINGS',
    viewValue: 'android.settings.NETWORK_OPERATOR_SETTINGS',
  },
  {
    value: 'android.settings.NFCSHARING_SETTINGS',
    viewValue: 'android.settings.NFCSHARING_SETTINGS',
  },
  {
    value: 'android.settings.NFC_PAYMENT_SETTINGS',
    viewValue: 'android.settings.NFC_PAYMENT_SETTINGS',
  },
  { value: 'android.settings.NFC_SETTINGS', viewValue: 'android.settings.NFC_SETTINGS' },
  { value: 'android.settings.VPN_SETTINGS', viewValue: 'android.settings.VPN_SETTINGS' },
  {
    value: 'android.settings.WIFI_IP_SETTINGS',
    viewValue: 'android.settings.WIFI_IP_SETTINGS',
  },
  { value: 'android.settings.WIFI_SETTINGS', viewValue: 'android.settings.WIFI_SETTINGS' },
  {
    value: 'android.settings.WIRELESS_SETTINGS',
    viewValue: 'android.settings.WIRELESS_SETTINGS',
  },

  // Application settings
  {
    value: 'android.settings.ALL_APPS_NOTIFICATION_SETTINGS',
    viewValue: 'android.settings.ALL_APPS_NOTIFICATION_SETTINGS',
  },
  {
    value: 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS',
    viewValue: 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS',
  },
  {
    value: 'android.settings.APPLICATION_SETTINGS',
    viewValue: 'android.settings.APPLICATION_SETTINGS',
  },
  {
    value: 'android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS',
    viewValue: 'android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS',
  },
  {
    value: 'android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION',
    viewValue: 'android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION',
  },
  {
    value: 'android.settings.MANAGE_APPLICATIONS_SETTINGS',
    viewValue: 'android.settings.MANAGE_APPLICATIONS_SETTINGS',
  },
  {
    value: 'android.settings.MANAGE_DEFAULT_APPS_SETTINGS',
    viewValue: 'android.settings.MANAGE_DEFAULT_APPS_SETTINGS',
  },
  {
    value: 'android.settings.action.MANAGE_OVERLAY_PERMISSION',
    viewValue: 'android.settings.action.MANAGE_OVERLAY_PERMISSION',
  },
  {
    value: 'android.settings.MANAGE_UNKNOWN_APP_SOURCES',
    viewValue: 'android.settings.MANAGE_UNKNOWN_APP_SOURCES',
  },
  {
    value: 'android.settings.action.MANAGE_WRITE_SETTINGS',
    viewValue: 'android.settings.action.MANAGE_WRITE_SETTINGS',
  },

  {
    value: 'android.settings.APP_SEARCH_SETTINGS',
    viewValue: 'android.settings.APP_SEARCH_SETTINGS',
  },
  {
    value: 'android.search.action.SEARCH_SETTINGS',
    viewValue: 'android.search.action.SEARCH_SETTINGS',
  },
  {
    value: 'android.settings.HARD_KEYBOARD_SETTINGS',
    viewValue: 'android.settings.HARD_KEYBOARD_SETTINGS',
  },
  {
    value: 'android.settings.INPUT_METHOD_SETTINGS',
    viewValue: 'android.settings.INPUT_METHOD_SETTINGS',
  },
  {
    value: 'android.settings.INPUT_METHOD_SUBTYPE_SETTINGS',
    viewValue: 'android.settings.INPUT_METHOD_SUBTYPE_SETTINGS',
  },
  {
    value: 'android.settings.USER_DICTIONARY_SETTINGS',
    viewValue: 'android.settings.USER_DICTIONARY_SETTINGS',
  },
  {
    value: 'android.settings.VOICE_INPUT_SETTINGS',
    viewValue: 'android.settings.VOICE_INPUT_SETTINGS',
  },

  // Display and UI settings
  {
    value: 'android.settings.AUTO_ROTATE_SETTINGS',
    viewValue: 'android.settings.AUTO_ROTATE_SETTINGS',
  },
  {
    value: 'android.settings.CAPTIONING_SETTINGS',
    viewValue: 'android.settings.CAPTIONING_SETTINGS',
  },
  { value: 'android.settings.DISPLAY_SETTINGS', viewValue: 'android.settings.DISPLAY_SETTINGS' },
  { value: 'android.settings.DREAM_SETTINGS', viewValue: 'android.settings.DREAM_SETTINGS' },
  {
    value: 'android.settings.NIGHT_DISPLAY_SETTINGS',
    viewValue: 'android.settings.NIGHT_DISPLAY_SETTINGS',
  },

  // Power and battery settings
  {
    value: 'android.settings.BATTERY_SAVER_SETTINGS',
    viewValue: 'android.settings.BATTERY_SAVER_SETTINGS',
  },
  {
    value: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    viewValue: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
  },

  // Security and biometric settings
  {
    value: 'android.settings.BIOMETRIC_ENROLL',
    viewValue: 'android.settings.BIOMETRIC_ENROLL',
  },
  {
    value: 'android.settings.FINGERPRINT_ENROLL',
    viewValue: 'android.settings.FINGERPRINT_ENROLL',
  },
  {
    value: 'android.settings.PRIVACY_SETTINGS',
    viewValue: 'android.settings.PRIVACY_SETTINGS',
  },
  {
    value: 'android.settings.SECURITY_SETTINGS',
    viewValue: 'android.settings.SECURITY_SETTINGS',
  },

  // System and device settings
  { value: 'android.settings.DATE_SETTINGS', viewValue: 'android.settings.DATE_SETTINGS' },
  {
    value: 'android.settings.DEVICE_INFO_SETTINGS',
    viewValue: 'android.settings.DEVICE_INFO_SETTINGS',
  },
  { value: 'android.settings.HOME_SETTINGS', viewValue: 'android.settings.HOME_SETTINGS' },
  { value: 'android.settings.LOCALE_SETTINGS', viewValue: 'android.settings.LOCALE_SETTINGS' },
  {
    value: 'android.settings.LOCATION_SOURCE_SETTINGS',
    viewValue: 'android.settings.LOCATION_SOURCE_SETTINGS',
  },
  { value: 'android.settings.SETTINGS', viewValue: 'android.settings.SETTINGS' },
  {
    value: 'android.settings.SHOW_REGULATORY_INFO',
    viewValue: 'android.settings.SHOW_REGULATORY_INFO',
  },
  {
    value: 'android.settings.SHOW_WORK_POLICY_INFO',
    viewValue: 'android.settings.SHOW_WORK_POLICY_INFO',
  },

  // Storage settings
  {
    value: 'android.settings.INTERNAL_STORAGE_SETTINGS',
    viewValue: 'android.settings.INTERNAL_STORAGE_SETTINGS',
  },
  {
    value: 'android.settings.MEMORY_CARD_SETTINGS',
    viewValue: 'android.settings.MEMORY_CARD_SETTINGS',
  },
  {
    value: 'android.settings.STORAGE_VOLUME_ACCESS_SETTINGS',
    viewValue: 'android.settings.STORAGE_VOLUME_ACCESS_SETTINGS',
  },

  // Sound and notification settings
  { value: 'android.settings.SOUND_SETTINGS', viewValue: 'android.settings.SOUND_SETTINGS' },
  {
    value: 'android.settings.NOTIFICATION_ASSISTANT_SETTINGS',
    viewValue: 'android.settings.NOTIFICATION_ASSISTANT_SETTINGS',
  },
  {
    value: 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTING',
    viewValue: 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTING',
  },
  {
    value: 'android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS',
    viewValue: 'android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS',
  },
  {
    value: 'android.settings.ZEN_MODE_PRIORITY_SETTINGS',
    viewValue: 'android.settings.ZEN_MODE_PRIORITY_SETTINGS',
  },

  // Sync and accounts
  {
    value: 'android.settings.MANAGE_ALL_SIM_PROFILES_SETTINGS',
    viewValue: 'android.settings.MANAGE_ALL_SIM_PROFILES_SETTINGS',
  },
  { value: 'android.settings.SYNC_SETTINGS', viewValue: 'android.settings.SYNC_SETTINGS' },

  // Miscellaneous settings
  {
    value: 'android.settings.ACTION_CONDITION_PROVIDER_SETTINGS',
    viewValue: 'android.settings.ACTION_CONDITION_PROVIDER_SETTINGS',
  },
  {
    value: 'android.settings.ACTION_PRINT_SETTINGS',
    viewValue: 'android.settings.ACTION_PRINT_SETTINGS',
  },
  {
    value: 'android.settings.QUICK_ACCESS_WALLET_SETTINGS',
    viewValue: 'android.settings.QUICK_ACCESS_WALLET_SETTINGS',
  },
  {
    value: 'android.settings.QUICK_LAUNCH_SETTINGS',
    viewValue: 'android.settings.QUICK_LAUNCH_SETTINGS',
  },
  {
    value: 'android.settings.REGIONAL_PREFERENCES_SETTINGS',
    viewValue: 'android.settings.REGIONAL_PREFERENCES_SETTINGS',
  },
  {
    value: 'android.settings.USAGE_ACCESS_SETTINGS',
    viewValue: 'android.settings.USAGE_ACCESS_SETTINGS',
  },
  {
    value: 'android.settings.VR_LISTENER_SETTINGS',
    viewValue: 'android.settings.VR_LISTENER_SETTINGS',
  },
  { value: 'android.settings.WEBVIEW_SETTINGS', viewValue: 'android.settings.WEBVIEW_SETTINGS' },
];
