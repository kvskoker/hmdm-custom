# Build the launcher and enroll devices

For this repository: custom Headwind server 7.03.1 and launcher 6.39.

The setup order is **server address -> signed APK -> upload -> configuration -> QR code -> test device**. Building the server does not build the Android APK. You can build the APK on your Windows or Linux computer and upload it through the server's web panel.

## 1. Prepare the server address

Use one real, device-accessible address, such as `https://mdm.example.com`. Replace that example everywhere below with your address. For production, use HTTPS with a publicly trusted certificate. `localhost` on a phone means the phone itself, not your server.

If the custom server is already running, skip the startup commands. Check that you can open its address from the network your devices will use.

For a **new Docker installation only**, install Docker with Compose, open a terminal in the `hmdm-custom` repository root, and create `.env` if it does not exist:

Windows PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Linux Bash:

```bash
test -f .env || cp .env.example .env
nano .env
```

Set these values in `.env`, keeping the remaining template settings:

```ini
DEPLOY_MODE=prod
HMDM_DOMAIN=mdm.example.com
LETSENCRYPT_EMAIL=admin@example.com
SQL_PASS=REPLACE_WITH_A_LONG_RANDOM_PASSWORD
```

`HMDM_DOMAIN` is the hostname only, without `https://` or a path. Point DNS to the server. Allow inbound TCP 80/443 for HTTPS setup and access, and TCP 31000 for device push messages. Do not expose PostgreSQL publicly.

Start from the repository root:

```powershell
# Windows: Docker Desktop must be running in Linux-container mode.
.\deploy.ps1 up
.\deploy.ps1 logs
```

```bash
# Linux
bash ./deploy.sh up
bash ./deploy.sh logs
```

Stop following logs with Ctrl+C; the containers keep running. On a fresh installation, sign in with `admin` / `admin` and change the password immediately.

**Existing base-v7 server:** do not run a fresh installation over it. Follow [the upgrade checklist](UPGRADE-v7.md), preserving its database and uploaded files and preventing first-install seeding. Never use `deploy reset` or `docker compose down -v` to fix enrollment.

## 2. Prepare the Android build tools

### Match the device authentication secret

MQTT authentication requires the server's `hash.secret` to match the launcher's
compiled `REQUEST_SIGNATURE`. These legacy defaults differ in this repository;
set them explicitly before deploying a new fleet. Use the same private value for
server `.env` setting `HMDM_SHARED_SECRET` and, on the APK build computer, the
user-level `~/.gradle/gradle.properties` setting `hmdmRequestSignature` (Windows:
`%USERPROFILE%\.gradle\gradle.properties`). Do not put the real value in Git.
Use a long random value consisting of letters, digits, underscores and hyphens.
The APK build also accepts `HMDM_SHARED_SECRET` from its process environment;
an explicit Gradle property takes precedence. The server's `.env` is not loaded
automatically by Gradle.

For an already installed fleet, first use the exact value compiled into its APK
as the server setting. Changing the server alone to a new random value breaks
MQTT authentication for existing launchers. Rebuild the server image once to
install the environment-override support; later secret changes need a container
recreation (`deploy up`), not another build. The secret is separate from your APK
signing keystore and database/admin passwords. Keep `MQTT_AUTH=1`. After a change,
test one device's automatic command delivery before rolling out more devices.

The bundled launcher uses plain TCP MQTT, not TLS; the shared secret alone does
not encrypt this channel. Plan a separately tested TLS/VPN deployment for sensitive
networks rather than assuming HTTPS also protects port 31000.

### Install the toolchain

Install a **JDK 17** and [Android Studio](https://developer.android.com/studio). In Android Studio's SDK Manager install:

- Android SDK Platform 34.
- Android SDK Build-Tools 35.0.0 (enable Show Package Details to select it).
- Android SDK Command-line Tools (latest).
- Android SDK Platform-Tools.

Use the SDK location shown in SDK Manager. The commands below assume the usual location. Set `JAVA_HOME` to your actual JDK 17 installation and put its `bin` directory on `PATH`. Do not accept an automatic Gradle/plugin upgrade when opening this project. The repository provides Gradle 8.13 and Android Gradle Plugin 8.13.2; their [compatibility requirements](https://developer.android.com/build/releases/agp-8-13-0-release-notes) include JDK 17 and Build-Tools 35.0.0.

The launcher supports Android 8 and later. QR provisioning also depends on the device manufacturer's setup support.

## 3. Build and sign on Windows

Run these blocks in the same PowerShell window. Run one command at a time and stop on any error.

### Set paths and install SDK packages

Start in the repository root:

```powershell
Set-Location .\hmdm-android
$env:JAVA_HOME = "C:\Path\To\Your\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$sdkmanager = "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat"
$buildTools = "$env:ANDROID_HOME\build-tools\35.0.0"
java -version
& $sdkmanager --licenses
& $sdkmanager "platform-tools" "platforms;android-34" "build-tools;35.0.0"
.\gradlew.bat --version
```

Replace the JDK placeholder first. Accept SDK licenses when prompted. If the SDK path differs, change `ANDROID_HOME`; if `local.properties` exists, ensure its `sdk.dir` points to the same SDK.

### Choose the signing key

**Existing fleet:** use the original launcher's keystore and alias. Do not generate a replacement key. Set `$keystore` to that file and `$alias` to its alias.

**New fleet only:** create a key once, outside the repository:

```powershell
New-Item -ItemType Directory -Force "$HOME\hmdm-signing" | Out-Null
$keystore = "$HOME\hmdm-signing\hmdm-release.jks"
$alias = "hmdm"
keytool -genkeypair -v -storetype JKS -keystore "$keystore" -alias "$alias" -keyalg RSA -keysize 4096 -validity 10000
```

Enter passwords at the prompts. Back up the key and passwords securely. Do not commit them or upload the keystore to the MDM server.

### Build and sign

```powershell
$server = "https://mdm.example.com"
.\gradlew.bat --no-daemon clean assembleOpensourceRelease "-PhmdmBaseUrl=$server" "-PhmdmSecondaryUrl=$server" "-PhmdmServerProject=" "-PhmdmMqttPort=31000"

$release = "app\build\outputs\apk\opensource\release"
& "$buildTools\zipalign.exe" -f -v 4 "$release\app-opensource-release-unsigned.apk" "$release\launcher-aligned.apk"
& "$buildTools\apksigner.bat" sign --ks "$keystore" --ks-key-alias "$alias" --out "$release\hmdm-launcher-release.apk" "$release\launcher-aligned.apk"
& "$buildTools\apksigner.bat" verify --verbose --print-certs "$release\hmdm-launcher-release.apk"
& "$buildTools\aapt.exe" dump badging "$release\hmdm-launcher-release.apk" | Select-String "package:"
Get-FileHash "$release\hmdm-launcher-release.apk" -Algorithm SHA256
```

Signing prompts for the keystore/key passwords; no password belongs in a command or build file. The build should print your real address for both `BASE_URL` and `SECONDARY`. Confirm package `com.hmdm.launcher` and successful signature verification.

**Upload this file:** `hmdm-android\app\build\outputs\apk\opensource\release\hmdm-launcher-release.apk`.

## 4. Build and sign on Linux

Use this instead of the Windows section. Run in Bash, starting at the repository root. Install JDK 17 first; on Ubuntu/Debian, `sudo apt install openjdk-17-jdk` provides it. Set the JDK path below to the installed location (the example is for Ubuntu/Debian x86-64).

```bash
set -e
cd hmdm-android
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/Android/Sdk"
SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
BUILD_TOOLS="$ANDROID_HOME/build-tools/35.0.0"
java -version
"$SDKMANAGER" --licenses
"$SDKMANAGER" "platform-tools" "platforms;android-34" "build-tools;35.0.0"
bash ./gradlew --version
```

**Existing fleet:** set `KEYSTORE` and `KEY_ALIAS` to the existing key and alias. Skip key generation.

**New fleet only:** create the key once and back it up securely:

```bash
mkdir -p "$HOME/hmdm-signing"
chmod 700 "$HOME/hmdm-signing"
KEYSTORE="$HOME/hmdm-signing/hmdm-release.jks"
KEY_ALIAS=hmdm
keytool -genkeypair -v -storetype JKS -keystore "$KEYSTORE" -alias "$KEY_ALIAS" -keyalg RSA -keysize 4096 -validity 10000
chmod 600 "$KEYSTORE"
```

Build, align, sign, and verify:

```bash
SERVER="https://mdm.example.com"
bash ./gradlew --no-daemon clean assembleOpensourceRelease "-PhmdmBaseUrl=$SERVER" "-PhmdmSecondaryUrl=$SERVER" "-PhmdmServerProject=" "-PhmdmMqttPort=31000"

RELEASE=app/build/outputs/apk/opensource/release
"$BUILD_TOOLS/zipalign" -f -v 4 "$RELEASE/app-opensource-release-unsigned.apk" "$RELEASE/launcher-aligned.apk"
"$BUILD_TOOLS/apksigner" sign --ks "$KEYSTORE" --ks-key-alias "$KEY_ALIAS" --out "$RELEASE/hmdm-launcher-release.apk" "$RELEASE/launcher-aligned.apk"
"$BUILD_TOOLS/apksigner" verify --verbose --print-certs "$RELEASE/hmdm-launcher-release.apk"
"$BUILD_TOOLS/aapt" dump badging "$RELEASE/hmdm-launcher-release.apk" | grep "package:"
sha256sum "$RELEASE/hmdm-launcher-release.apk"
```

**Upload this file:** `hmdm-android/app/build/outputs/apk/opensource/release/hmdm-launcher-release.apk`.

Both build procedures assume the repository's unsigned release configuration, with no local signing overrides. Alignment must happen before signing; do not modify the signed APK afterward. See [Android's APK signing instructions](https://developer.android.com/tools/apksigner).

## 5. Upload the APK to the server

1. Sign in to the custom server as an administrator and open **Applications**.
2. Add an application and upload `hmdm-launcher-release.apk`. If `com.hmdm.launcher` already exists, add the APK as a version of that application instead of creating a different package.
3. Confirm the detected package is **com.hmdm.launcher** and the version matches your build. Save the application/version.
4. Copy the uploaded version's download URL. Open it from a signed-out/private browser on the devices' network. It must download the APK without an administrator login or certificate warning.
5. Keep the APK hosted on this server. A private GitHub repository URL is not a usable provisioning download URL.

No server rebuild or restart is needed just to upload a launcher. Upload the final signed APK, not the unsigned or aligned intermediate file, and not an Android App Bundle (`.aab`).

## 6. Connect the APK to a configuration

1. Open **Configurations** and create or edit the configuration your devices will use.
2. In its **Applications** section, include the uploaded launcher version and save. This makes the version available for selection in MDM settings.
3. Open **MDM Settings**. Set **MDM application** to your uploaded launcher version. This is the setting sometimes called the "main app".
4. Set **Admin receiver class** to `com.hmdm.launcher.AdminReceiver`. Enter only the class name, not `com.hmdm.launcher/com.hmdm.launcher.AdminReceiver`.
5. Optionally enter the provisioning Wi-Fi details, then save the configuration. Leave advanced QR parameters unchanged unless you specifically need them.
6. Open the configuration's QR action and confirm the QR image appears.

The server generates the APK download URL and checksum from the selected version. You do not need to calculate or paste a QR checksum manually. Do not replace an APK file behind an existing URL: its stored checksum may no longer match. Upload a new version and select it instead.

## 7. Use the custom group enrollment QR

For automatically numbered devices, use **Device Enrollment**, not an individual device QR:

1. Select or create the group and select the configuration prepared above.
2. Set a prefix, such as `LAB`, **Digits** to `3`, and **Next sequence** to `1`; enable the rule and save it.
3. Open that rule's **Enrollment QR code** action. New assignments should follow the rule, for example `LAB001`, `LAB002`.

The rule's configuration still needs the uploaded launcher selected as its MDM application. Treat enrollment QR codes as sensitive: they can include Wi-Fi credentials and allow device enrollment.

## 8. Enroll a test device

Use a spare, factory-new or already-reset device. **Factory resetting an existing device erases its data; do not reset a working fleet device just to try the guide.**

On a supported Android setup screen, tap the welcome screen six times to start QR provisioning, connect to Wi-Fi if requested, and scan the QR code. Let Android download the launcher and complete management setup. A normal camera scan or manually installing the APK on an already-configured phone does not grant device-owner management. See [Headwind's enrollment quick start](https://h-mdm.com/quick-start/).

Check that the device appears in **Devices**, has the intended configuration/group/number, and reports a recent connection. Test sync, lock/unlock, reboot, and tracking before wider rollout. Password reset needs Android's reset-token setup; wipe should only be tested on a disposable device. A server acknowledgment alone does not prove the physical action completed.

## Address and update rules

- The Docker hostname and APK defaults are separate settings. `.env` does not configure the Android build.
- The commands explicitly set primary and secondary URLs, overriding project defaults. In the current build script, Gradle properties take precedence over environment variables; do not rely on `HMDM_BASE_URL` to override a value in `gradle.properties`.
- QR enrollment supplies the primary URL and server path. The secondary URL is not included by default, so compile it correctly too.
- For a server at `https://mdm.example.com/hmdm`, use `https://mdm.example.com` for both base URLs and `-PhmdmServerProject=/hmdm`. The Docker setup in this repository uses the root path, so the commands above leave it empty.
- Keep `gradle.properties` to settings and `#` comments. Run shell commands in a terminal, not inside that file.
- For updates, preserve package `com.hmdm.launcher` and the signing key. Increase `versionCode` in `hmdm-android/app/build.gradle` above the installed fleet value (currently the source has `15390`) and use a distinct `versionName`, for example `6.39-custom.2`.
- Build and upload the new version, assign it to a test configuration first, then update the remaining configurations after testing. Refresh the QR code after selecting a new MDM application version.
- Existing devices signed with another key, including the official Headwind key, cannot receive your custom-signed APK as an ordinary in-place update. Plan a separate tested migration. Do not use debug signing for production.

## Common problems

| Problem | What to check |
|---|---|
| Java or Gradle startup fails | JDK 17 selected by `JAVA_HOME`; wrapper reports Gradle 8.13. |
| SDK location or license error | `ANDROID_HOME`, any `local.properties`, installed Platform 34/Build-Tools 35.0.0, accepted licenses. |
| Dependency download fails | Build computer can reach Google Maven, Maven Central, and the repositories named in the Gradle files. Capture the first failing URL; do not randomly upgrade dependencies. |
| QR action disabled or image missing | Saved configuration has an uploaded launcher version selected as MDM application and the correct admin receiver class. |
| QR generation returns an error | Selected APK URL/file exists and is readable by the server; inspect `deploy logs`. |
| Phone cannot download the APK | Public hostname, DNS, trusted HTTPS, firewall, and direct download without authentication. No `localhost` or emulator-only address. |
| Checksum mismatch | New signed APK uploaded as a new version, selected in the configuration; no proxy/file replacement changing its bytes. |
| APK rejected during installation | Signed APK, Android 8+, correct package/receiver, matching certificate for updates, sufficient version code. |
| Device enrolls but commands are delayed | TCP 31000 reachability, device connectivity, and matching server/launcher MQTT authentication settings. |
| Device is connected but not on the map | Configuration enables location tracking; location services and permissions are granted. |

For a LAN-only test, use the computer's reachable LAN IP and port (for example `http://192.168.1.20:8080`) consistently. `10.0.2.2` is only for the Android emulator. Production QR testing should use trusted HTTPS; never disable certificate verification to work around provisioning failures.
