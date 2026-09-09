# Headwind MDM — local development environment

A Dockerised Headwind MDM server **built from the GitHub source**, plus notes for
enrolling an Android Studio emulator against it. Same on Windows, macOS and Linux.

The official `hmdm-docker` image downloads a pre-built WAR from h-mdm.com. This one
compiles the source, so the `devicereset` plugin we are adding actually ends up in the
running server.

## Where the source comes from

Two Dockerfiles, both multi-stage. Neither takes Headwind's *source* from a registry —
only the toolchain images (Maven+JDK 11, Tomcat 9, Postgres) come from Docker Hub, which
is what those images are for.

| File | Source of the code | Use it for |
|---|---|---|
| `docker/Dockerfile` | your working copy in `./hmdm-server` | **development** — your edits are in the image |
| `docker/Dockerfile.git` | `git clone` from GitHub at a pinned ref, inside the build | **CI and production** — reproducible, depends on nothing local |

`Dockerfile.git` stages: **fetch** (alpine/git clones the repo) → **build** (Maven on JDK 11
compiles the WAR) → **runtime** (Tomcat serves it). It records the repo and ref it built
from in `/opt/hmdm-install/BUILD_SOURCE.txt` inside the image.

```bash
docker build -f docker/Dockerfile.git \
  --build-arg HMDM_REPO=https://github.com/YOURORG/hmdm-server.git \
  --build-arg HMDM_REF=v1.0.0-devicereset \
  -t hmdm-server:1.0.0 .
```

## Layout

```
hmdm-dev/
├── setup.sh              # clones hmdm-server + hmdm-android
├── docker-compose.yml
├── docker/
│   ├── Dockerfile        # dev: build from ./hmdm-server
│   ├── Dockerfile.git    # release: clone from GitHub, pinned ref
│   └── entrypoint.sh     # renders ROOT.xml, seeds the DB on first run
├── hmdm-server/          # git clone (gitignored)
├── hmdm-android/         # git clone, opened in Android Studio (gitignored)
└── docs/FINDINGS-pin-reset.md
```

`hmdm-android` is deliberately **not** containerised — the emulator needs hardware
acceleration from the host, so the launcher is developed natively in Android Studio.

## Running

```bash
./setup.sh                  # or: git clone the two repos yourself
docker compose up --build
```

On Windows use Git Bash or WSL for `setup.sh`, or just run the two `git clone` commands
in PowerShell.

First build downloads the full Maven dependency tree. After that the `.m2` cache is a
BuildKit cache mount, so rebuilds take a minute or two.

| | |
|---|---|
| Panel | http://localhost:8080 — `admin` / `admin` |
| Panel from the emulator | http://10.0.2.2:8080 |
| MQTT push | localhost:31000 → 10.0.2.2:31000 from the emulator |
| Postgres | localhost:5433, db/user `hmdm`, password `topsecret` |

```bash
docker compose logs -f hmdm            # server log
docker compose up -d --build hmdm      # rebuild after a code change
docker compose exec db psql -U hmdm    # poke at the database
docker compose down -v                 # wipe everything including the database
```

### Why JDK 11 and not JDK 8

The root pom sets `java.version=1.8`, which is the *bytecode target*, not the compiler.
Some dependencies — `activemq-broker` in the `notification` module in particular — ship
class files at version 55 (Java 11), and a JDK 8 `javac` cannot read those at all:

```
bad class file: .../activemq-broker-5.18.6.jar(org/apache/activemq/broker/BrokerPlugin.class)
  class file has wrong version 55.0, should be 52.0
```

Upstream `BUILD.txt` says Ubuntu 22.04 + `apt install maven`, where the default JDK is
11 — so JDK 11 compiling to Java 8 bytecode is what Headwind actually builds with, and
what both Dockerfiles use.

### Two settings that differ from the upstream template

- `mqtt.server.uri` binds to `0.0.0.0:31000`, not a hostname. Binding to a name that
  resolves to an address the NIC doesn't hold gives `Cannot assign requested address`
  and the broker silently never starts — the exact failure we hit on the GCE box.
- `mqtt.auth` is `0` in dev to keep emulator testing simple. **Production stays at 1.**

## Enrolling an emulator

1. **Create an AVD without Google Play.** Device Manager → a phone → a system image
   labelled *Google APIs* or *AOSP*, **not** *Google Play*. API 33 or 34. Play images
   refuse `dpm set-device-owner`.

2. **Point the launcher at the dev server** — `hmdm-android/app/build.gradle`:

   ```gradle
   buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:8080\"")
   buildConfigField("String", "SECONDARY_BASE_URL", "\"http://10.0.2.2:8080\"")
   ```

   Plain HTTP is fine; the manifest already sets `usesCleartextTraffic="true"`.

3. **Install and promote to device owner** on a freshly wiped emulator with no accounts:

   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   adb shell dpm set-device-owner com.hmdm.launcher/com.hmdm.launcher.AdminReceiver
   ```

   Expect `Success: Device owner set to package com.hmdm.launcher`. A refusal means the
   emulator has an account or is already provisioned — wipe data and retry.

4. **Enrol** — launch the app and give it a device number that exists in the panel.

## Proving the PIN reset path before writing the plugin

```bash
adb shell locksettings set-pin 1111
# then unlock the emulator once by hand
```

That unlock matters: `setResetPasswordToken()` only becomes active after the user next
enters their existing credential. Then get `"passwordReset": "2222"` into the sync
response for that device and watch the log for `Password successfully changed`. That one
line proves the whole chain and turns the rest of the project into plumbing and UI.

See `docs/FINDINGS-pin-reset.md` for why no launcher changes are needed.
