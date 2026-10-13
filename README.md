# Custom Headwind MDM

Self-hosted Android device management. A fork of [Headwind MDM](https://h-mdm.com) (Apache-2.0) with three plugins added.

It builds the server and custom plugins from `hmdm-server/`. Version 7 also
downloads the upstream plugin-platform dependency from Headwind's Maven
repository at build time. The runtime does not download Headwind source.

For device ownership, custom assignment fields, Excel import/export and the
configurable inactivity policy, see [Device assignments](docs/DEVICE-ASSIGNMENTS.md).

---

## Deploy

For non-Docker installations and upgrades from base v7, see the
[native installation and upgrade guide](docs/INSTALL-UPGRADE-NATIVE.md).

Two settings in `.env` decide everything.

```bash
git https://github.com/kvskoker/hmdm-custom.git && cd hmdm-custom
cp .env.example .env      # edit DEPLOY_MODE and HMDM_DOMAIN
./deploy.sh up            # Windows:  .\deploy.ps1 up
```

First build takes 5-10 minutes. After that the panel is up at the address the
script prints. Sign in with **admin / admin** and change the password.

**Then upload a launcher APK — enrollment does not work without one.** A QR code
carries the download URL and SHA-256 of the APK the device installs as device
owner, so the server has to be holding that file. A fresh database ships with no
usable launcher: the upstream rows that point at `h-mdm.com` are parked on first
start, because this deployment must not depend on anyone else's download server.
Build one (see *Building the launcher APK*) or upload an existing build under
**Applications**, then select that version under the configuration's
**MDM Settings > MDM application**, with admin receiver class
`com.hmdm.launcher.AdminReceiver`. Until that is done, the QR action may be
disabled or fail to display an image.

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

## Port conflicts

If Nginx already owns ports 80/443, keep it and set `HMDM_PROXY=external`
with `DEPLOY_MODE=prod`. Follow [the Nginx setup guide](docs/NGINX-SETUP.md)
to stop bundled Caddy and configure HTTPS forwarding. Do not switch to dev
mode just to disable Caddy: that changes device URLs to HTTP.

Set host ports in `.env`, above the generated `derived by deploy` block:

```ini
HMDM_HTTP_PORT=8088
DB_HOST_PORT=5434
MQTT_HOST_PORT=31000
CADDY_HTTP_PORT=80
CADDY_HTTPS_PORT=443
```

Then run `bash ./deploy.sh up` (Windows: `.\deploy.ps1 up`). No image rebuild
is needed for a port change. Existing database and file volumes are retained.
Do not edit the generated `PANEL_PUBLISH` or `DB_PUBLISH` entries: the scripts
derive those from the settings above. Invalid port numbers are rejected.

In production, changing `HMDM_HTTP_PORT` moves only the loopback binding, for
example to `127.0.0.1:8088`. The public address remains `https://your-domain`;
Caddy still connects internally to `hmdm:8080`, and QR URLs do not change.
In development, the advertised address and QR URLs use the selected port,
for example `http://192.168.1.50:8088`. Match the launcher build URLs to it.

Changing `MQTT_HOST_PORT` changes the external push port, not the container's
31000 listener. Configure the launcher with `-PhmdmMqttPort=YOUR_PORT` and
update firewall rules. Existing launchers are not automatically reconfigured.
Keep 31000 unless you have planned that device-side change.

The Caddy port options are for setups forwarding public TCP 80/443 to different
host ports. Changing them alone does not change the advertised HTTPS URL or
make certificate validation work on arbitrary ports. If another web server
already owns public 80/443, arrange reverse proxying/certificate handling before
starting this stack's Caddy; do not stop the other application blindly.

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

Follow [Build the launcher and enroll devices](docs/LAUNCHER-SETUP.md) for:

1. Server address and Android SDK setup.
2. Windows PowerShell and Linux Bash build/signing commands.
3. Uploading the APK and selecting **MDM application** in **MDM Settings**.
4. Group enrollment QR codes, device testing, and launcher updates.

Use the same signing key for every launcher update. The guide keeps signing
passwords out of command arguments and explicitly sets both server addresses.

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
