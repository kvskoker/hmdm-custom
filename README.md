# Headwind MDM — Medtronic Labs fork

Self-hosted Android device management for the Sierra Leone health-worker fleet.
This upgrade branch targets server 7.03.1 and Android 6.39. See
[the upgrade notes](docs/UPGRADE-v7.md) before using an existing database.
A fork of [Headwind MDM](https://h-mdm.com) (Apache-2.0) with three plugins added.

It builds the server and custom plugins from `hmdm-server/`. Version 7 also
downloads the upstream plugin-platform dependency from Headwind's Maven
repository at build time. The runtime does not download Headwind source.

---

## Deploy

Two settings in `.env` decide everything.

```bash
git clone git@github.com:YOURORG/YOURREPO.git && cd YOURREPO
cp .env.example .env      # edit DEPLOY_MODE and HMDM_DOMAIN
./deploy.sh up            # Windows:  .\deploy.ps1 up
```

First build takes 3–5 minutes. After that the panel is up at the address the
script prints. Sign in with **admin / admin** and change the password.

**Then upload a launcher APK — enrollment does not work without one.** A QR code
carries the download URL and SHA-256 of the APK the device installs as device
owner, so the server has to be holding that file. A fresh database ships with no
usable launcher: the upstream rows that point at `h-mdm.com` are parked on first
start, because this deployment must not depend on anyone else's download server.
Build one (see *Building the launcher APK*) or upload an existing build under
**Applications**, then open the configuration and set it as the **main app**.
Until that is done, requesting a QR code returns HTTP 500.

| Command | What it does |
|---|---|
| `./deploy.sh up` | Start. Builds the image if it doesn't exist yet. |
| `./deploy.sh rebuild` | Rebuild the server after a code change, then start. |
| `./deploy.sh logs` | Follow the server log. |
| `./deploy.sh down` | Stop. Database and uploaded APKs are kept. |
| `./deploy.sh reset` | Stop **and delete** the database and uploaded APKs. |

### Production

```ini
DEPLOY_MODE=prod
HMDM_DOMAIN=mdm.example.com
LETSENCRYPT_EMAIL=you@example.com
SQL_PASS=<something long>
```

`./deploy.sh up` then starts Caddy alongside the server. Caddy obtains a Let's
Encrypt certificate for your domain and renews it by itself — there is no
certbot and no renewal cron. Tomcat and Postgres are bound to loopback; only
Caddy and the MQTT port are reachable from outside.

Before the first production start:

- point the domain's **DNS A record** at the host
- open **80**, **443** and **31000** in the firewall
- set `SQL_PASS` — it is written into the database on creation and is awkward
  to change afterwards

Testing DNS? Uncomment `CADDY_CA` in `.env` to use Let's Encrypt's staging
endpoint first. A misconfigured domain against the real endpoint burns your
rate limit for a week.

### Development

```ini
DEPLOY_MODE=dev
HMDM_DOMAIN=10.0.2.2      # the Android emulator's route to your host
```

Panel on `http://localhost:8080`, Postgres on `5433`. For a real handset on the
same network, set `HMDM_DOMAIN` to your machine's LAN IP instead — that value is
what the server advertises to devices in QR codes and APK download URLs, so
`localhost` will not work from a phone.

---

## Why port 31000 is published in both modes

Push notifications use MQTT, which is a raw TCP connection rather than HTTP.
A reverse proxy cannot carry it, so the server publishes 31000 directly and
devices connect to `HMDM_DOMAIN:31000`. Without it devices still sync, just on
their own schedule instead of when you ask them to — which also makes lost-device
tracking fall back to the launcher's fixed 15-minute interval.

---

## What's in here

```
docker/          the deployment. Dockerfile builds the server from source;
                 entrypoint.sh renders the Tomcat config from environment
                 variables at start-up; Caddyfile is the production proxy.
hmdm-server/     the fork. Upstream Headwind plus the plugins below.
hmdm-android/    the launcher. Only needed to build a customised APK.
tools/           diagnostics, kept out of the deployment path.
docs/            longer notes.
```

### Plugins added by this fork

| Plugin | What it does |
|---|---|
| **Device Management** (`devicereset`) | Remote PIN reset, reboot, lock, factory reset — with a retyped device number required before a wipe. |
| **Device Enrollment** (`deviceenroll`) | One QR code per group, devices numbered automatically (`KAI001`, `KAI002`…). Groups share a configuration, so app deployment stays in one place. |
| **Device Tracking** (`devicelocation`) | Devices on a map, last few positions kept per device. Report one lost and the server pushes it every couple of minutes until you mark it found. |

The plugins hook into upstream through `SyncResponseHook` and the event bus, so
`hmdm-server` stays close to upstream and can be diffed against it.

---

## Building the launcher APK

You need a launcher APK on the server before any device can enrol — QR
enrollment installs it, so it cannot be skipped. Build your own if you want the
server address baked in as the default; otherwise upload a build you already
have.

### Server address

The launcher compiles in a primary and a secondary server address. Both resolve
in this order, first match wins:

1. `-PhmdmBaseUrl=...` / `-PhmdmSecondaryUrl=...` on the command line
2. `HMDM_BASE_URL` / `HMDM_SECONDARY_URL` in the environment
3. `gradle.properties`
4. the default in `app/build.gradle`

`gradle.properties` in this repo is set to the emulator address
(`http://10.0.2.2:8080`) for local work, so **a build for real devices must
override it.** The build prints what it resolved — check that line before you
ship the APK:

```
[hmdm] BASE_URL=https://mdm.example.com  SECONDARY=https://mdm.example.com
```

QR enrollment sends `com.hmdm.BASE_URL`, which overrides the compiled primary,
so a wrong primary is survivable. The **secondary is not sent by the server**,
so whatever is compiled in is what devices keep — and `GetServerConfigTask`
really does fall back to it when the primary fails. Left at the emulator
address, every failed sync in the field retries against a dead host.

For local testing, a debug build against the emulator is fine:

```bash
cd hmdm-android
./gradlew assembleOpensourceDebug
```

**For a fleet, build release-signed.** Android accepts an update only if it is
signed with the same key as the installed app, and debug builds use a throwaway
keystore generated per machine. A fleet enrolled with a debug build can never be
updated from anywhere else — the only remedy is re-enrolling every device.

Create the key once and keep it somewhere that outlives any single laptop:

```bash
keytool -genkeypair -v -keystore hmdm-release.jks \
        -alias hmdm -keyalg RSA -keysize 4096 -validity 10000
```

Then build with it. The Android Gradle Plugin takes the key on the command line,
so the repository needs no change and no secret:

```bash
./gradlew assembleOpensourceRelease \
  -PhmdmBaseUrl=https://mdm.example.com \
  -PhmdmSecondaryUrl=https://mdm.example.com \
  -Pandroid.injected.signing.store.file=$PWD/hmdm-release.jks \
  -Pandroid.injected.signing.store.password="$KS_PASS" \
  -Pandroid.injected.signing.key.alias=hmdm \
  -Pandroid.injected.signing.key.password="$KS_PASS"
```

On Windows, **quote each `-P` argument and set the password first**. PowerShell
mangles an unquoted argument containing `=`, and an empty variable is passed as
nothing at all — which shifts the remaining arguments and produces the confusing
`Cannot locate tasks that match '.injected.signing.store.file=C:\...'`.

```powershell
$env:KS_PASS = Read-Host "Keystore password"
$ks = (Resolve-Path .\hmdm-release.jks).Path

./gradlew assembleOpensourceRelease `
  "-PhmdmBaseUrl=https://mdm.example.com" `
  "-PhmdmSecondaryUrl=https://mdm.example.com" `
  "-Pandroid.injected.signing.store.file=$ks" `
  "-Pandroid.injected.signing.store.password=$env:KS_PASS" `
  "-Pandroid.injected.signing.key.alias=hmdm" `
  "-Pandroid.injected.signing.key.password=$env:KS_PASS"
```

Confirm what you built before it reaches any device:

```bash
apksigner verify --print-certs app/build/outputs/apk/opensource/release/*.apk
```

Whoever holds this keystore controls launcher updates for the whole fleet. It
belongs in the MoH's custody, escrowed, not on one workstation — losing it means
re-enrolling every device, and leaking it means someone else can push a launcher
update to all of them.

Upload the resulting APK in **Applications**, then set it as the main app of a
configuration so QR enrolment can install it.

---

## Troubleshooting

**Devices don't appear on the map.** The tracking page names the cause itself —
usually the configuration's *Location Tracking* is "No active tracking", or the
launcher was never granted the location permission. `tools/diagnose-location.ps1`
walks the whole chain on a connected emulator or handset and reports the first
broken link.

**Push doesn't reach devices.** Check 31000 is open and that `MQTT_AUTH` matches
what the launcher expects. The server logs `Failed to create MQTT broker service`
if the broker could not bind.

**Users can factory-reset their device from Settings.** Add this to
*Configurations → edit → Settings → Restrictions*:

```
no_factory_reset,no_safe_boot,no_add_user,no_debugging_features,no_config_date_time,no_modify_accounts,no_install_unknown_sources,no_network_reset
```

`no_factory_reset` is the one that matters; the rest close the routes around it.
Note that hiding the pull-down shade itself is a premium Headwind feature and is
a stub in the open-source launcher — these restrictions lock what is behind the
door rather than hiding the door.

---

## Upstream

Apache-2.0, from [h-mdm/hmdm-server](https://github.com/h-mdm/hmdm-server) and
[h-mdm/hmdm-android](https://github.com/h-mdm/hmdm-android). To compare against
upstream later:

```bash
git remote add upstream-server https://github.com/h-mdm/hmdm-server.git
git fetch upstream-server
git diff upstream-server/master --stat -- hmdm-server
```

There is no shared history, so that diff lists every file — still useful for
spotting your changes and for picking up upstream fixes by hand.
