# Install Custom HMDM or Upgrade an Existing Base v7 Installation

Audience: Linux administrators running Headwind MDM directly on Tomcat and PostgreSQL, without Docker.

Public source repository: https://github.com/kvskoker/hmdm-custom

This guide describes the repository as inspected on 13 October 2026. Record and approve the exact Git commit used for each deployment. These native procedures have been reviewed against the scripts, but have not been executed end-to-end on your server. Rehearse upgrades on a restored test installation first.

## 1. Choose the Correct Procedure

| Current situation | Procedure |
| --- | --- |
| New server and empty database | Build, then run `hmdm_install.sh` as described in section 4. |
| Base v7 already installed, even with no enrolled devices | Back up and replace the application as described in section 5. |
| Docker installation | Use [Production deployment](DEPLOY-production.md), not this guide. |

**Never rerun `hmdm_install.sh` to preserve an existing installation.** It detects the existing `users` table and offers to erase database tables or abort. There is no data-preserving upgrade switch. Do not type `erase` on an existing installation. Do not run `migrate.sh`; it targets a different runtime migration, not this base-v7-to-custom upgrade.

No GitHub credentials are needed to clone the public repository. Server credentials, signing keys, `.env` files, and production configuration must remain outside Git.

## 2. Prerequisites and Important Differences

- Ubuntu Linux is the intended environment; the installer identifies Ubuntu 24.04 as its tested platform.
- Use JDK 21 and Maven 3.9 for the build. Maven downloads the configured frontend tools and dependencies; internet access is required.
- Have PostgreSQL and a running, systemd-managed Tomcat installed before running the installer. The custom Docker runtime has been tested with Tomcat 11.0.24 and Java 21. Upstream describes Tomcat 10+, but this guide does not certify every Tomcat 10 installation. Validate the actual runtime on staging; never downgrade an existing working runtime just to follow an example.
- Provision a supported, security-maintained Tomcat version through your administrator's normal process. This guide does not install or replace the Tomcat runtime itself.
- Install `aapt` for APK metadata processing, and confirm it is accessible to the Tomcat service.
- Set up DNS, HTTPS, and the MQTT connection required by devices. Keep PostgreSQL private and restrict direct Tomcat access when using a reverse proxy.
- A native installation does **not** automatically consume the repository's Docker `.env`. Its external Tomcat context XML supplies database, domain, storage, and MQTT settings.

Inspect an existing installation:

```bash
java -version
mvn -version
systemctl list-units --all --type=service 'tomcat*'
sudo find /etc/tomcat* /var/lib/tomcat* -path '*/Catalina/localhost/*.xml' -print
sudo find /var/lib/tomcat* -maxdepth 2 -name '*.war' -print
```

Missing glob paths can produce harmless `find` warnings. If Tomcat is installed elsewhere, inspect that location too. Check `systemctl cat YOUR_TOMCAT_SERVICE` to identify the actual runtime and Java settings. A shell's `java -version` alone does not prove which Java the service uses.

The installer guesses the Tomcat directory from `/var/lib/tomcat*`. With multiple installations, review its `TOMCAT_HOME`, `TOMCAT_SERVICE`, and `TOMCAT_USER` settings before using it. Do not let it guess the wrong application server.

## 3. Build the Custom Server

Build as a normal user, preferably on a separate build machine. Example build dependencies on Ubuntu:

```bash
sudo apt update
sudo apt install -y git openjdk-21-jdk maven aapt
java -version
mvn -version
git clone https://github.com/kvskoker/hmdm-custom.git
cd hmdm-custom
git rev-parse HEAD
cd hmdm-server
test -f server/build.properties || cp server/build.properties.example server/build.properties
test -f plugins/audit/build.properties || cp plugins/audit/build.properties.example plugins/audit/build.properties
mvn -B -ntp install
```

Verify Maven is using Java 21. For repeatable releases, check out your approved tag or commit before building. On an existing clone, review local changes before fetching or checking out another revision; do not overwrite local settings.

Continue only after `BUILD SUCCESS`. Expected outputs:

```bash
test -s server/target/launcher.war
test -d target/shared-libs
ls target/shared-libs
sha256sum server/target/launcher.war
```

Keep the WAR, shared libraries, source commit, checksum, and build log together as one release. If building elsewhere, transfer those outputs to the deployment server and verify their checksums. Never substitute an older WAR after a failed build.

The example build properties are build inputs, not production configuration. Preserve or create a correct external Tomcat context; audit it against the custom template so sample paths, secrets, and URLs cannot become unintended fallbacks.

## 4. Fresh Native Installation Only

This section requires an empty database, preinstalled Tomcat/PostgreSQL, and the successful build from section 3.

### 4.1 Create the Database

For a local PostgreSQL installation, open its administration prompt:

```bash
sudo -u postgres psql
```

Run the following only if this role and database do not already exist:

```sql
CREATE ROLE hmdm LOGIN;
\password hmdm
CREATE DATABASE hmdm OWNER hmdm;
\q
```

Store the password securely. The bundled installer constructs a PostgreSQL connection URI and renders XML using shell substitutions; certain punctuation in credentials can break this legacy path. It is not the Docker deployment's improved secret renderer. If a credential fails, stop and have the installer/configuration handling corrected; do not weaken an existing production password or paste secrets into support logs.

### 4.2 Run the Installer from the Source Directory

```bash
cd ~/hmdm-custom/hmdm-server
sudo bash ./hmdm_install.sh
```

Adjust the path if cloned elsewhere. The current directory must contain `install/` and the built `server/target/launcher.war`.

Answer the prompts using your installation values:

| Prompt | Guidance |
| --- | --- |
| Database | The empty database and role just created; normally port 5432. |
| Storage directory | Persistent directory under the selected Tomcat base, as required by this installer. Record it for backups. |
| Scripts directory | Normally `/opt/hmdm`. |
| Protocol | `https` for production. |
| Domain | Your own hostname, for example `mdm.mohs.gov.sl`, without `https://` or a path. |
| Port | Leave empty for public HTTPS on 443; do not enter a private proxy-upstream port. |
| Project path | `ROOT` for the domain root, or the deliberately chosen existing-style context. |
| SMTP | Optional; configure deliberately rather than accepting sample credentials. |
| Existing database / erase | Abort. Switch to section 5. |

If Nginx already handles HTTPS, decline the installer's LetsEncrypt/Tomcat HTTPS and iptables redirection offers. Preserve the reverse proxy and certificate renewal setup. See [Nginx setup](NGINX-SETUP.md), adapting Docker-specific upstream values to the native Tomcat listener. Include WebSocket forwarding and suitable upload limits.

The installer currently seeds an upstream launcher reference (its `CLIENT_VERSION` is 6.37). It does **not** build or select the custom Android APK. Decline downloading the upstream APKs for this workflow, and replace the launcher selection as described in section 6 before enrollment.

After installation, change the initial `admin` / `admin` password immediately. Audit the generated context XML, especially `hash.secret`, `secure.enrollment`, database credentials, storage paths, `base.url`, and MQTT settings. Use deployment-specific secrets consistent with the custom launcher, not the template defaults. XML values must be correctly escaped. Protect configuration files with access appropriate to the Tomcat service; never make them publicly downloadable.

## 5. Upgrade Base v7 Without Erasing Data

### 5.1 Rehearse and Inventory

Restore a backup into an isolated staging installation first. Do not run staging and production against the same database or file storage, and prevent staging from contacting production devices or sending production notifications.

Record the existing database connection, context name, Tomcat service/user, uploaded-file and plugin directories, hostname, certificate setup, MQTT configuration, shared secret, and launcher signing identity. Do not change these merely because the code is changing.

The following commands assume a dedicated Tomcat instance, local PostgreSQL with database `hmdm`, and deployment at the domain root. **Edit every example variable to match the verified installation.** If Tomcat hosts other applications or PostgreSQL is remote, have the administrator adapt the procedure before proceeding.

```bash
TOMCAT_BASE=/var/lib/tomcat11
TOMCAT_SERVICE=tomcat11
TOMCAT_USER=tomcat
CONTEXT=ROOT
DATA_DIR=/var/lib/tomcat11/work
DB_NAME=hmdm
RELEASE="$HOME/hmdm-custom/hmdm-server"
BACKUP="/var/backups/hmdm/$(date +%Y%m%d-%H%M%S)"

test -d "$TOMCAT_BASE/webapps"
test -d "$DATA_DIR"
test -s "$RELEASE/server/target/launcher.war"
test -d "$RELEASE/target/shared-libs"
```

**Stop if any check fails.** For deployment under `/hmdm`, use `CONTEXT=hmdm`, not `ROOT`. Confirm there is no custom `docBase` pointing elsewhere in the external context. That deployment needs an adapted replacement procedure.

### 5.2 Stop and Back Up

Schedule maintenance, block new requests, and take a recoverable VM/server snapshot where available. Then:

```bash
set -o pipefail
sudo systemctl stop "$TOMCAT_SERVICE"
sudo install -d -m 700 "$BACKUP"
sudo -u postgres pg_dump -Fc "$DB_NAME" | sudo tee "$BACKUP/database.dump" > /dev/null
sudo pg_restore --list "$BACKUP/database.dump" > /dev/null
sudo cp -a "$TOMCAT_BASE" "$BACKUP/tomcat-base"
sudo cp -a "$DATA_DIR" "$BACKUP/application-data"
```

Execute backup pipelines in a shell with `set -o pipefail` enabled so a failed `pg_dump` is not hidden by `tee`. Check every command's exit status. Listing a dump is a basic check, not a substitute for a tested restore.

Also back up external configuration targets, particularly `/etc/tomcat*`, the systemd service and overrides, reverse-proxy configuration, and TLS material. `cp -a` preserves symlinks: a copy of a symlinked `conf` directory does not back up its external contents. Include every storage path outside `DATA_DIR` and preserve database-role information securely. Keep an off-server backup.

### 5.3 Install the Matching WAR and Libraries

Keep Tomcat stopped. Move the old application out of its watched deployment directory:

```bash
if sudo test -f "$TOMCAT_BASE/webapps/$CONTEXT.war"; then
  sudo mv "$TOMCAT_BASE/webapps/$CONTEXT.war" "$BACKUP/previous.war"
fi
if sudo test -d "$TOMCAT_BASE/webapps/$CONTEXT"; then
  sudo mv "$TOMCAT_BASE/webapps/$CONTEXT" "$BACKUP/previous-exploded"
fi
sudo install -m 644 -o "$TOMCAT_USER" \
  "$RELEASE/server/target/launcher.war" "$TOMCAT_BASE/webapps/$CONTEXT.war"
```

Before copying shared libraries, compare `target/shared-libs/` with the existing Tomcat library directories. Move obsolete versions of the **same HMDM dependencies** into the backup directory. Do not delete Tomcat's own libraries or unrelated application dependencies. Leaving two versions of a dependency can cause startup failures.

After that review:

```bash
sudo cp "$RELEASE"/target/shared-libs/*.jar "$TOMCAT_BASE/lib/"
```

Ensure copied JARs are readable by the service. Preserve the existing external context XML; compare parameter names with `install/context_template.xml` and add missing required settings deliberately. **Do not replace the context with the template**, which contains placeholders and example secrets. Preserve the existing logging configuration and email templates as well.

### 5.4 Start and Validate

```bash
sudo systemctl start "$TOMCAT_SERVICE"
sudo systemctl status "$TOMCAT_SERVICE" --no-pager
sudo journalctl -u "$TOMCAT_SERVICE" --since '10 minutes ago' --no-pager
```

Also inspect the installation's configured HMDM application log. On startup, Liquibase applies the custom schema changes. Do not run `hmdm_init.*.sql` against the existing database. If migrations fail, stop and investigate; do not delete changelog records or reset checksums as a workaround.

Verify on staging and again after cutover:

- Existing administrator accounts, roles, devices, configurations, APKs, and download URLs remain intact.
- Device Management, Device Tracking, Device Enrollment, and device assignment/custom-field features are present and permitted for the intended users.
- Login, branding, uploads, WebSockets, Excel import/export, and inactivity policy work.
- A test device synchronizes automatically and receives a harmless test command without manually downloading configuration.
- The selected launcher downloads from its advertised HTTPS URL, and a disposable device can enroll using the QR code.

Use a new browser session to check for stale cached frontend assets. A running service or HTTP 200 response alone does not establish a successful upgrade.

### 5.5 Rollback

If validation fails, stop the upgraded Tomcat service and retain failure logs. Restore the pre-upgrade database into a clean replacement database, restore application storage and configuration from the same backup point, and restore the previous WAR and matching library set. Point the restored application at the restored database before restarting. A verified VM snapshot may simplify this if it includes all relevant storage and the database.

Do not merely replace the WAR and run old code against a newly migrated database. A database rollback also discards changes made after the backup, which is why maintenance and validation are required.

## 6. Custom Launcher and Device Enrollment

The web WAR and launcher APK are separate deliverables. See [Launcher setup and build instructions](LAUNCHER-SETUP.md) for the build process and signing requirements.

1. Build the custom launcher for the deployment's server URL, MQTT port, and matching shared secret.
2. Upload the signed APK under Applications and save the application/version. Confirm its URL is populated and accessible from a phone without a portal login.
3. In the device configuration, select this uploaded version as the MDM application. Use receiver `com.hmdm.launcher.AdminReceiver` where requested.
4. Generate a new provisioning QR code and test it on a factory-reset test device before enrolling the fleet.
5. Confirm command delivery, policy application, and application installation with the screen locked as well as unlocked.

For existing devices, preserve the server URL, enrolled identity, and credentials. A server upgrade alone should not require re-enrollment, but it does not install the custom launcher either. An in-place APK update requires the same package identity, compatible signing key, and an appropriate higher version code. If the original APK was signed by another publisher and its signing key is unavailable, plan a tested reset/re-enrollment process instead of forcing an update. Screen-PIN reset also depends on an active Android reset token; a web feature cannot override that prerequisite.

## 7. Ongoing Maintenance

Deploy reviewed custom release commits, not arbitrary upstream WAR files. Do not use the stock portal's web-update workflow to overwrite the customization. Merge upstream changes into the custom repository, build a matched WAR/library release, test on staging, and repeat the backup-and-upgrade procedure.

Keep a deployment record containing the Git commit, WAR checksum, Java/Tomcat versions, database version, backup location, selected launcher version/signing-certificate fingerprint, and validation results. Store actual credentials and signing keys separately and securely.
