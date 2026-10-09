# Headwind 7.03.1 upgrade

## Source versions

- Custom fork baseline: `51b023d` (server based on 5.41.1).
- Server: `h-mdm/hmdm-server-v7`, tag `7.03.1`, commit `e25fed98eb7dd248185f1434d4831df97352dbff`.
- Android: `h-mdm/hmdm-android`, tag `v6.39`, commit `7a26a16e913ef7976dfc5c991dbc9253fe3bce12`.
- The Android code was already 6.39. Its existing endpoint/build customization is retained.

## Port design

The upstream v7 server and Angular application replace the legacy v5 tree.
The three custom Java plugins remain embedded JARs, which v7 supports through
PluginJarList. This preserves `/rest/plugins/{name}/...` endpoints, the core
injector's synchronization hooks, and the location event listener and scheduler.
Their Angular pages are lazy routes under `/home/fleet/management`,
`/home/fleet/tracking`, and `/home/fleet/enrollment`. They use the existing role
permissions; they are custom Community Edition extensions, not upstream
commercial plugin implementations.

The small custom additions to SyncResponseInt and SyncResponse are retained.
The existing Liquibase change sets, logical file paths, and custom table names
must stay unchanged. New schema changes must be appended as new change sets.
The removed legacy resource accessor is replaced by v7's classpath accessor.

Runtime: Java 21, Tomcat 11.0.24, PostgreSQL 14. The Docker build installs
v7's shared libraries in Tomcat's lib directory. The plugin-platform dependency
is downloaded from Headwind's Maven repository. Cache and archive that dependency
alongside a released image for reproducible/offline deployment.

The server explicitly declares Headwind's Maven repository (upstream declares
it only for the plugin parent). QR image rendering uses ZXing 3.5.3 directly
from Maven Central instead of the QRGen wrapper hosted on JitPack. Enrollment
JSON generation is unchanged; a PNG encode/decode test covers UTF-8 payloads.
Docker verifies cached Node archives against the official SHA-256 checksums
and retries interrupted downloads.
The core/UI-library package manager is pinned to pnpm 10.26.0, which supports
its upstream workspace build allowlist. Plugin builds retain upstream's
pnpm 9.15.0. Core installs use the committed lockfile and prefer cached packages.

## Isolated local preview

```powershell
docker build -t hmdm-custom:7.03.1 -f docker/Dockerfile .
docker compose -f docker-compose.v7-test.yml up -d
```

Open http://localhost:8087. The test configuration uses a separate database and
data volume, a loopback-only web port, and no published MQTT port. It cannot
serve a fleet as configured. Fresh installs use the upstream admin/admin login.
Upload a launcher APK and select it in a configuration before QR provisioning.

## Existing installation migration

1. Preserve the old image, configuration, Android signing key, and full database
   and application-data backups, including uploaded APKs and the `.seeded` marker.
2. Restore the database and application data into an isolated staging stack.
   Never attach two versions to the same database. Do not use `deploy reset`.
3. Start the v7 image against that restored copy. Check successful Liquibase
   initialization, login/roles, existing device identities, configurations,
   enrollment rules and numbering counters, and custom command/location history.
4. Use dedicated test devices to verify sync, APK delivery, QR enrollment,
   automatic numbering, password reset, lock/unlock, reboot, lost/found tracking,
   and location history. Test factory reset only on a disposable test device.
   An acknowledgement of reboot/wipe does not prove that the physical action
   completed. Password reset depends on an active Android reset token.
5. Schedule the production cutover only after those checks. Keep the existing
   public hostname, file URLs and MQTT identity. Reuse the installed APK signing
   identity for any future launcher update.
6. Rollback requires restoring the pre-upgrade database and application data
   together with the old image. Do not point v5 at a database migrated by v7.

The official Ubuntu `migrate.sh` manages host Tomcat services; it is not the
migration procedure for this Docker deployment.

## Validation boundary

### Fleet UI refinements (verified locally)

The custom navigation follows Dashboard and Devices. Enrollment and tracking
forms keep their save actions inline on large screens. Tracking uses a fixed
OpenStreetMap layer and attribution, with search above the map. Management uses
the existing access-scoped device search and three history tabs with server-side
pagination, text search, status/command filters and a time period filter.
The new paged history endpoint excludes PINs and enforces customer and device-group
access; the legacy history endpoints remain unchanged for compatibility.

`tools/test-v7-fleet-ui.cjs` creates and removes isolated test fixtures for IMEI
search, pagination beyond 200 records, group access and desktop/mobile layouts.
After recovering Docker, the final production build, eleven Java tests and app
startup passed. The query-helper registration and device-search response parsing
issues found during verification are fixed. Both browser suites passed, covering
menu order, IMEI/serial/description lookup, ambiguous search results, matching
control heights, all three history tabs, 205-record pagination, filters, PIN
privacy, anonymous denial and restricted device-group access. Desktop and mobile
layouts, inline save controls, hidden map settings and loaded map tiles were
checked. All eighteen original API regression checks also passed. Synthetic
pagination fixtures are removed after testing; no real devices receive commands.

The results below describe the earlier completed upgrade validation.

Validated locally on 8 October 2026:

- Complete 17-module Docker/Maven production build, including the Angular UI.
- Seven Java tests covering command serialization, wipe authorization and
  confirmation, PIN privacy, and QR PNG round-trip decoding.
- Successful startup on Tomcat 11 and Liquibase migration of a synthetic v5
  database, without reseeding it.
- Eighteen API checks passed against v7: retained devices, locks, numbering rules
  and counters, lost records and location history; anonymous access denial;
  simulated PIN, unlock, reboot, wipe and lost/found command exchanges.
- Playwright checks passed for management, enrollment and tracking at desktop
  (1440x1000) and mobile (390x844) sizes, including visible field labels, wipe
  confirmation, migrated numbering, loaded map tiles, no page overflow and no
  browser runtime errors. Screenshots were visually inspected.

`tools/test-v7-api.ps1 -SeedLegacy` creates synthetic fixtures on the isolated
v5 stack. After replacing only its image with v7, run the script without the
switch to check record preservation, command delivery and acknowledgements,
PIN privacy, wipe confirmation, and lost/found tracking. It is fixed to
localhost:8087 and V7-TEST001; do not adapt it to production devices.

`tools/test-v7-ui.cjs` uses Playwright with local Microsoft Edge to check the
three custom pages and wipe confirmation, and writes desktop/mobile screenshots
to `test-results/v7`. Playwright must be available to Node's module resolver.
The script uses the isolated stack's default admin credentials and does not
submit a wipe command.

Source compilation and automated tests do not establish physical-device or
production-database compatibility. No production database is included in this
workspace, and no fleet device should receive a command during local validation.
