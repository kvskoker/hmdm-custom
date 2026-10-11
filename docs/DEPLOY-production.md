# Deploying the PIN reset plugin to production (historical v5 guide)

> This document records the original v5/Tomcat 9 deployment. Do not run its
> version checkout, database deletion or WAR replacement steps on the current
> custom v7 Docker installation. For v7 use [the upgrade guide](UPGRADE-v7.md),
> [Nginx setup](NGINX-SETUP.md) and [launcher setup](LAUNCHER-SETUP.md).

## Current v7 deployment address

The production hostname is `HMDM_DOMAIN` in the repository root `.env`; it is
not a fixed domain in this guide. Set `DEPLOY_MODE=prod` for HTTPS. Keep existing
credentials and set `HMDM_HTTP_PORT` to your Docker host port. The public panel
and QR download URLs use `https://${HMDM_DOMAIN}`.

From the repository root on the VPS, verify the resolved settings without
contacting the server:

```bash
bash tools/diagnose-web-speed.sh --check
```

For the hostname-aware WebSocket regression test, run this on a development
machine with Node.js 22.18+ and the configured root `.env`:

```bash
node tools/test-websocket-url.mjs
```

The test is offline; it does not connect to the production host. The remaining
sections below are historical notes, not the current deployment procedure.

## What is actually being deployed

Two things at once, and it is important to be clear about that:

1. **The `devicereset` plugin** — new code, new table, new REST endpoints.
2. **A server version change.** Production runs an official release WAR installed by
   `hmdm_install.sh`. Our fork is built from `master`, which currently sits at the
   `v5.41.1` commit. If production is on an earlier release, this deploy is also a
   Headwind upgrade, with whatever schema migrations that entails.

No device-side change is required. The stock launcher already implements the whole
PIN reset path; that is the finding this project rests on.

## Before you schedule anything

**Confirm the production version.** Web panel → admin → About. Note it.

- If it is **5.41.1**, the delta is only our plugin. Lowest risk.
- If it is **older**, decide explicitly: upgrade to 5.41.1 as part of this, or rebase
  our changes onto the matching tag (`git checkout -b devicereset v5.40.1`, then
  re-apply) so the only change is the plugin. Rebasing is more work but makes the
  deploy a single-variable change, which is what you want on a clinical system.

**Confirm the launcher versions in the field.** Devices tab → launcher version column.
The reset token is provisioned by `Utils.initPasswordReset()`, which exists in the 6.x
launcher line. Any device on an older launcher will accept the reset request and fail
to apply it. Update those launchers first, using the normal app-update flow — the
stock launcher, no fork needed.

**Check disk.** The production VM had ~5.5 GB free. A WAR deploy plus a database dump
needs headroom.

```bash
df -h /
```

## 1. Pin the build

Never deploy from a moving branch.

```bash
cd hmdm-server
git checkout -b devicereset-1.0 v5.41.1     # or the tag matching production
# re-apply if you branched from an older tag:
#   plugins/devicereset/**
#   common/src/main/java/com/hmdm/rest/json/SyncResponseInt.java
#   server/src/main/java/com/hmdm/rest/json/SyncResponse.java
#   plugins/pom.xml, server/pom.xml
git add -A
git commit -m "Device PIN reset plugin"
git tag v1.0.0-devicereset
git push origin devicereset-1.0 --tags        # to your own fork remote
```

## 2. Rehearse against a copy of production data

This is the step that catches migration problems before they matter.

```bash
# on the production server
sudo -u postgres pg_dump hmdm | gzip > ~/hmdm-$(date +%F).sql.gz
```

Copy it to your dev machine, load it into the local Docker stack, and deploy the new
WAR against it. You are checking that Liquibase runs cleanly against *real* data, not
against an empty seed database.

```powershell
docker compose down -v
docker compose up -d db
Get-Content hmdm-2026-09-07.sql | docker compose exec -T db psql -U hmdm -d hmdm
docker compose up -d --build hmdm
docker compose logs hmdm | Select-String "ERROR|devicereset"
```

Then exercise the feature end to end against the emulator.

## 3. Build the production WAR

Reproducibly, from the pinned tag:

```bash
docker build -f docker/Dockerfile.git \
  --build-arg HMDM_REPO=https://github.com/YOURORG/hmdm-server.git \
  --build-arg HMDM_REF=v1.0.0-devicereset \
  -t hmdm-server:1.0.0-devicereset .

docker create --name extract hmdm-server:1.0.0-devicereset
docker cp extract:/usr/local/tomcat/webapps/ROOT.war ./ROOT.war
docker rm extract
```

`docker/Dockerfile.git` records the repo and ref it built from in
`/opt/hmdm-install/BUILD_SOURCE.txt`, so you can always tell what a WAR came from.

## 4. Deploy

Pick a window with no clinical activity. Copy `ROOT.war` to the server first, then:

```bash
# --- backup ---
sudo -u postgres pg_dump hmdm | gzip > ~/hmdm-predeploy-$(date +%F).sql.gz
sudo cp -a /var/lib/tomcat9/webapps/ROOT.war ~/ROOT.war.backup
sudo cp -a /etc/tomcat9/Catalina/localhost/ROOT.xml ~/ROOT.xml.backup

# --- deploy ---
sudo systemctl stop tomcat9
sudo rm -rf /var/lib/tomcat9/webapps/ROOT          # remove the exploded app
sudo cp ROOT.war /var/lib/tomcat9/webapps/ROOT.war
sudo chown tomcat:tomcat /var/lib/tomcat9/webapps/ROOT.war
sudo chmod 644 /var/lib/tomcat9/webapps/ROOT.war
sudo systemctl start tomcat9

# --- watch it come up ---
sudo tail -f /var/log/tomcat9/catalina.out
```

`ROOT.xml` is untouched by the deploy — your database credentials, `base.url`,
`mqtt.server.uri` and `mqtt.auth=1` all survive.

## 5. Verify

```bash
# Liquibase ran
sudo -u postgres psql hmdm -c "SELECT id FROM databasechangelog WHERE id LIKE 'plugin-devicereset%';"
# plugin registered
sudo -u postgres psql hmdm -c "SELECT identifier, name FROM plugins ORDER BY id;"
# MQTT still up
sudo ss -tlnp | grep 31000
sudo grep -i "MQTT notification service started" /var/log/tomcat9/catalina.out | tail -1
```

Then in the panel: sign out and back in, confirm "Device PIN Reset" appears, and check
that existing devices are still syncing normally.

## 6. Rollback

If anything is wrong, the WAR goes back in under a minute:

```bash
sudo systemctl stop tomcat9
sudo rm -rf /var/lib/tomcat9/webapps/ROOT
sudo cp ~/ROOT.war.backup /var/lib/tomcat9/webapps/ROOT.war
sudo systemctl start tomcat9
```

**Schema changes do not roll back with the WAR.** Our three changesets only add a table
and rows, so the old WAR runs fine alongside them — it simply ignores them. If you also
upgraded Headwind versions, that is no longer true, and a restore from the pre-deploy
dump is the real rollback. That asymmetry is the main argument for rebasing onto the
production tag rather than upgrading at the same time.

## 7. Pilot before announcing

Do not tell the support desk it is live until one real device has been through it:

1. Pick a low-stakes device that is online.
2. Queue a reset, watch it land, unlock with the new PIN.
3. Confirm the history row reaches "Confirmed".

## Support desk notes

- **Never tell a locked-out user to reboot the device.** Between boot and first unlock,
  Android seals credential-encrypted storage and the launcher does not run, so the reset
  cannot be delivered. A reboot turns a recoverable device into a factory-reset device.
- The device must be online. Queued resets are not lost — they apply whenever the device
  next syncs — so queue it immediately and tell the user to get to a known network.
- After several failed PIN attempts Android imposes a cooling-off timer. The new PIN is
  correct; the user may need to wait out the timer.
- The PIN is displayed once and never retrievable. Read it to the user before closing.
- Tell the user to set their own PIN afterwards in Settings → Security.
