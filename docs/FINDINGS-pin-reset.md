# Device PIN reset — what already exists, and what we actually need to build

*Investigation against `h-mdm/hmdm-server` and `h-mdm/hmdm-android`, master, Sept 2026.
Both repositories are Apache-2.0, so forking, modifying and self-hosting are all permitted.*

## Headline

**The Android launcher already implements remote PIN reset in full.** We do not need to fork
it, rebuild it, re-sign it, or re-enroll a single device. The missing piece is entirely
server-side: a plugin that Headwind ships only in their premium build.

This changes the shape of the project completely. The earlier assumption — fork the
launcher, add `resetPasswordWithToken`, re-provision every device — was wrong.

## Evidence

### 1. The launcher provisions a reset token on every startup

`app/src/main/java/com/hmdm/launcher/helper/Initializer.java:60`

```java
Utils.lockSafeBoot(context);
Utils.initPasswordReset(context);
```

`Initializer.init()` is called from `MainActivity`, `InitialSetupActivity` and `BootReceiver` —
so this runs on every launch and every boot, unconditionally.

`Utils.initPasswordReset()` (`util/Utils.java:462`) generates a UUID, persists it in shared
preferences, and calls `dpm.setResetPasswordToken()`. It is careful about token slots:

```java
if (dpm.isResetPasswordTokenActive(adminComponentName)) return;
try { dpm.clearResetPasswordToken(adminComponentName); } catch (Exception ignored) {}
String token = getDataToken(context);
if (dpm.setResetPasswordToken(adminComponentName, token.getBytes())) { ... }
```

**Implication: every device already running launcher 6.x has a reset token provisioned.**
The capability is dormant on our fleet right now, waiting for a server to ask for it.

### 2. The launcher already applies a password sent by the server

`json/ServerConfig.java` carries a `passwordReset` field. `helper/ConfigUpdater.java:387`:

```java
private void checkPasswordReset() {
    ServerConfig config = settingsHelper != null ? settingsHelper.getConfig() : null;
    if (config != null && config.getPasswordReset() != null) {
        if (Utils.passwordReset(context, config.getPasswordReset())) {
            RemoteLogger.log(context, Const.LOG_INFO, "Password successfully changed");
        } else {
            RemoteLogger.log(context, Const.LOG_WARN, "Failed to reset password");
        }
        ConfirmPasswordResetTask confirmTask = new ConfirmPasswordResetTask(context) { ... };
        confirmTask.execute(DeviceInfoProvider.getDeviceInfo(context, true, true));
    }
}
```

And `Utils.passwordReset()` (`util/Utils.java:495`):

```java
boolean tokenActive = dpm.isResetPasswordTokenActive(adminComponentName);
if (!tokenActive) return false;
return dpm.resetPasswordWithToken(adminComponentName, password, getDataToken(context).getBytes(), 0);
```

So the launcher: reads `passwordReset` out of the sync response → sets the lock-screen
password with the token → calls back to the server to confirm → clears the pending state.

### 3. The endpoint it calls back belongs to a plugin that isn't open source

`server/ServerService.java:116`

```java
@POST("{project}/rest/plugins/devicereset/public/password/{number}")
Call<ResponseBody> confirmPasswordReset(@Path("project") String project,
                                        @Path("number") String number,
                                        @Body DeviceInfo deviceInfo);
```

`hmdm-server/plugins/` contains: `audit`, `deviceinfo`, `devicelog`, `messaging`,
`platform`, `push`, `xtra`. **There is no `devicereset`.** It is a premium plugin.

The same plugin backs `confirmDeviceReset` (factory reset) and `confirmReboot`.

### 4. The community server has a clean, supported extension point

`SyncResource.java:155` discovers hooks by scanning the Guice injector:

```java
for (Key<?> key : injector.getAllBindings().keySet()) {
    if (SyncResponseHook.class.isAssignableFrom(key.getTypeLiteral().getRawType())) {
        allYourInterfaces.add((SyncResponseHook) injector.getInstance(key));
    }
}
```

and applies them at line 496:

```java
for (SyncResponseHook hook : this.syncResponseHooks) {
    syncResponse = hook.handle(dbDevice.getId(), syncResponse);
}
```

A plugin that binds a `SyncResponseHook` can therefore decorate the sync response for a
given device without touching core server code.

## What we build

One server plugin, named `devicereset` — the name matters, because the launcher's REST
path is compiled in. Modelled on `plugins/messaging`, which is the smallest complete
example of the plugin pattern (Liquibase changelog, MyBatis mapper, Guice modules,
Jersey resource, AngularJS module + i18n).

### Server → device contract

The sync response (`GET /rest/public/sync/configuration/{number}`) gains one field:

```json
{ "passwordReset": "1234", ... }
```

Present only when a reset is pending for that device; absent or null otherwise.

### Device → server contract

```
POST /rest/plugins/devicereset/public/password/{number}
body: DeviceInfo
```

Server clears the pending reset and records the outcome. Must return 200 for the
launcher to treat it as confirmed.

### Components

| Piece | Where |
|---|---|
| `plugin_devicereset_password` table (deviceId, password, requestedBy, requestedAt, confirmedAt, status) | `liquibase/devicereset.changelog.xml` |
| `DeviceResetSyncHook implements SyncResponseHook` — injects `passwordReset` for devices with a pending row | `guice/module/` + `rest/` |
| `DeviceResetResource` — public confirm endpoint + private admin endpoint to request a reset | `rest/DeviceResetResource.java` |
| Push on request, so the device syncs immediately instead of on its 15-minute poll | reuse `PushService` (`configUpdated`) |
| "Reset PIN" action in the Devices tab + modal to enter/generate the new PIN | `src/main/webapp/` |
| Audit log entry for every reset (who, which device, when) | reuse `plugins/audit` |

### The one core-server change we may need

`SyncResponse` (server module) has no `passwordReset` field today. Two options, to be
settled by experiment in phase 1:

- **A (preferred, zero core changes):** the hook returns a subclass of `SyncResponse` that
  adds the getter. Jackson serialises the runtime type, so the field appears. Keeps our
  fork clean and trivially rebaseable on upstream.
- **B (fallback):** add the field to `SyncResponse` directly. Three lines, but it makes us
  carry a patch against upstream forever.

## Constraints and risks

**Token activation.** `setResetPasswordToken()` only becomes active after the user next
enters their existing credential — the launcher logs a warning when this is pending. A
device that has had a PIN set and has been unlocked at least once since the launcher
started will be fine. A device whose PIN was set *after* the last token provisioning and
never unlocked since is not resettable. `isResetPasswordTokenActive()` is the check; we
should surface that state per device in the panel so admins know before they promise a
user a working reset.

**Devices locked out right now** are still unrecoverable — the token has to pre-date the
lockout. This feature protects the fleet going forward, not the phones already bricked.

**Complexity policy.** `resetPasswordWithToken` fails if the new password doesn't satisfy
the active password quality policy. Our generated PINs must satisfy whatever
`passwordMode` the configuration sets.

**Android version.** `resetPasswordWithToken` is API 26+. `minSdkVersion` is already 26,
so every supported device qualifies.

**Upstream drift.** Headwind may ship their own `devicereset` plugin name into the open
source tree later, which would collide. Low risk, easy to rename if it happens.

## Sequencing

1. **Phase 0 — dev environment.** Dockerised server building from source + Android Studio
   emulator enrolled against it. Prove push and sync work end to end locally.
2. **Phase 1 — spike.** Hand-insert a `passwordReset` value into the sync response and
   confirm the emulator changes its lock PIN. This validates option A vs B and the token
   mechanics before any UI work.
3. **Phase 2 — plugin.** Build `plugins/devicereset` properly: schema, DAO, hook, REST,
   push trigger.
4. **Phase 3 — panel UI.** Devices tab action, PIN entry/generation, token-active
   indicator, audit entries.
5. **Phase 4 — hardening.** Permissions (which admin roles may reset), rate limiting,
   expiry of pending resets, and the operational runbook for the support desk.
