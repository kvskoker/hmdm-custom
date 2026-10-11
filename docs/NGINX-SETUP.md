# Run Headwind behind existing Nginx

Keep Nginx on public ports 80/443 and forward only the MDM hostname to Headwind
on `127.0.0.1:8088`. Do not stop Nginx or change its other sites. This guide
assumes Nginx is installed directly on the VPS, not in another container or
managed by a hosting/mail control panel. For those setups, configure the proxy
through that system instead; container-local `127.0.0.1` is not the VPS host.

## Slow login: measure and enable asset compression

First, from the repository root in the same Bash session, load the domain and
port from `.env` without executing its contents or exposing its secrets:

```bash
HMDM_DOMAIN="$(bash tools/diagnose-web-speed.sh --domain)" || exit 1
HMDM_HTTP_PORT="$(bash tools/diagnose-web-speed.sh --port)" || exit 1
```

Set `DEPLOY_MODE=prod` in `.env` for this HTTPS guide. Rerun these two commands
after editing `.env` or opening a new shell. Nginx files do not expand these
shell variables: use their resolved values when editing `server_name` and ports.

Run `bash tools/diagnose-web-speed.sh` on the VPS from the repository root.
The script reads `HMDM_DOMAIN`, `DEPLOY_MODE` and `HMDM_HTTP_PORT` from the
repository `.env`, regardless of your current directory. No hostname is
hardcoded. Use `bash tools/diagnose-web-speed.sh --check` to display only the
resolved URLs without making requests. Missing/invalid settings fail clearly.
The commands below use the loaded `HMDM_DOMAIN`.
It compares direct Tomcat and public HTTPS response times without printing
credentials or response bodies. Fast loopback responses with slow public ones
point toward the proxy/network path; slow loopback responses require server-side
investigation. These timings do not measure JavaScript execution in the browser.

The public deployment was observed serving JS/CSS without gzip on 2026-10-11.
To enable compression for frontend files only:

1. Locate the MDM HTTPS server block with
   `sudo nginx -T 2>&1 | grep -n -F -B 5 -A 35 "$HMDM_DOMAIN"`.
2. Back up that configuration file before editing it. Preserve its existing
   certificates, WebSocket settings and other sites.
3. Copy the snippet with
   `sudo install -m 644 docker/nginx-hmdm-assets.conf /etc/nginx/snippets/hmdm-assets.conf`.
   Set its upstream port to `HMDM_HTTP_PORT` from `.env` if yours is not 8088.
   Nginx configuration files do not read `.env` themselves; the snippet uses
   the request's host and contains no domain default.
4. Inside the MDM `server` block listening on 443, outside `location /`, add
   `include /etc/nginx/snippets/hmdm-assets.conf;`.
   Merge rather than duplicate any existing JS/CSS location. A `location ^~ /`
   would prevent this regex location from being selected.
5. Run `sudo nginx -t && sudo systemctl reload nginx`.

Request an actual JS file listed in the current page source with
`curl -sS -H 'Accept-Encoding: gzip' -D - -o /dev/null "https://${HMDM_DOMAIN}/ACTUAL-FILE.js"`.
Expect `Content-Encoding: gzip` for files larger than 1024 bytes. Compare a
private-window login before and after. No Docker rebuild is needed.

Also check HTTP/2 support. For Nginx 1.24, the existing TLS listen directive can
use `listen 443 ssl http2;` (and the equivalent IPv6 line if present). Preserve
other listen options. Nginx 1.25.1+ supports `http2 on;` instead. Validate before
reloading; do not replace the certificate configuration. HTTP/2 is not confirmed
enabled or disabled by a client that supports only HTTP/1.1.

Do not enable caching for `/rest/` or blanket-cache JSON: those include private
API responses and deployment manifests. To roll back the compression change,
remove the include line, validate and reload Nginx.

References: [Nginx gzip](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
and [HTTP/2](https://nginx.org/en/docs/http/ngx_http_v2_module.html).

## Configure Headwind

Use the updated deployment scripts from this repository. In `.env`, above the
generated block, set:

```ini
DEPLOY_MODE=prod
HMDM_PROXY=external
HMDM_DOMAIN=your-mdm-hostname.example
HMDM_HTTP_PORT=8088
```

Keep the existing SQL credentials and other settings. Replace the hostname if
needed. Port 8088 must be unused. Caddy's email and port settings are not used
in external mode. The public URL is `https://${HMDM_DOMAIN}` for QR codes
and APK downloads; this option does not configure Nginx or obtain a certificate.

From `~/hmdm-custom`, stop only the bundled Caddy service, then start Headwind:

```bash
docker compose --profile prod stop caddy
bash ./deploy.sh up
curl -I "http://127.0.0.1:${HMDM_HTTP_PORT}/"
```

An already-running Caddy container is not stopped merely by disabling its
profile, which is why the explicit stop is necessary. Do not delete volumes.
No image rebuild is required. Allow time for Headwind startup before testing.

## Configure the MDM virtual host

Back up Nginx configuration before editing. Inspect the existing configuration:

```bash
sudo nginx -T 2>&1 | grep -n -F "$HMDM_DOMAIN"
```

If the hostname already exists, edit its existing server block; do not add a
duplicate. Preserve working TLS certificate paths. Use the `location /` and
upload-size settings from `docker/nginx-hmdm.conf.example` inside its HTTPS
server block, keeping the HTTP-to-HTTPS redirect.
The template's `map` block belongs outside any `server` block, in Nginx's
`http` context (normally the enclosing context for `sites-enabled` files).
Include it once when copying the location settings; it provides the
`$hmdm_connection_upgrade` variable.

For a new hostname on Ubuntu/Debian using `sites-available`/`sites-enabled`, first
confirm `/etc/nginx/sites-available/hmdm` and `/etc/nginx/sites-enabled/hmdm` do
not already exist. Then:

```bash
sudo cp -n docker/nginx-hmdm.conf.example /etc/nginx/sites-available/hmdm
sudo nano /etc/nginx/sites-available/hmdm
sudo ln -s /etc/nginx/sites-available/hmdm /etc/nginx/sites-enabled/hmdm
sudo nginx -t
```

Replace `YOUR_HMDM_DOMAIN` in `server_name` with the resolved `HMDM_DOMAIN`
from `.env` and set the `proxy_pass` port to `HMDM_HTTP_PORT`. Stop if the test fails.
Only after a successful test:

```bash
sudo systemctl reload nginx
```

This uses Nginx's [HTTP proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html).
The upload limit allows APK uploads, the forwarded headers preserve the public
host/scheme, and the upgrade headers support WebSockets. MQTT is separate TCP
traffic; continue allowing the configured MQTT host port (normally 31000).

## Enable and verify HTTPS

If the hostname already has a valid certificate, keep its existing certificate
manager and renewal setup. Otherwise, point the hostname's DNS records to this
VPS and allow public TCP 80/443. On Ubuntu/Debian without an existing Certbot
installation or another certificate manager:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d "$HMDM_DOMAIN" --redirect
```

Enter the certificate contact email when prompted. Certbot modifies the matching
Nginx site to enable TLS. Review its changes, especially on a shared host. See
the [Certbot Nginx guide](https://eff-certbot.readthedocs.io/en/stable/using.html#nginx).
Do not install a second Certbot distribution if one is already installed.

```bash
sudo nginx -t
curl -I "https://${HMDM_DOMAIN}/"
sudo certbot renew --dry-run
```

Open the HTTPS panel and test an uploaded APK download from a signed-out browser
on the devices' network. Verify QR URLs use `https://${HMDM_DOMAIN}`, without
`:8088`. Do not enroll devices until HTTPS is valid. A 502 response usually means
Headwind is still starting, the proxy port differs from `HMDM_HTTP_PORT`, or the
proxy is in a container and cannot reach the host's loopback interface.

## Intermittent logo and cold-load requests

The default logo endpoint previously produced an absolute HTTP redirect when
Tomcat saw the proxied request as HTTP, even though the browser used HTTPS.
The corrected server returns the bundled PNG directly, preserving custom logos.
This fix requires a server image rebuild, not only an Nginx reload:

```bash
bash ./deploy.sh rebuild
HMDM_DOMAIN="$(bash tools/diagnose-web-speed.sh --domain)" || exit 1
curl -sS -D - -o /dev/null "https://${HMDM_DOMAIN}/rest/public/brand/logo"
```

Expect HTTP 200 and `Content-Type: image/png`, with no `Location` redirect.
The frontend service worker also now caches JavaScript on demand instead of
prefetching every top-level chunk. This reduces background downloads, but does
not eliminate the initial Angular/shared-library dependency downloads.
After deploying, close existing MDM tabs and test in a fresh private window.
If a normal window still uses the old service worker, clear site data for this
MDM hostname only (this signs you out), then reopen it.

The network panel's total finish time includes background requests; measure the
time until the sign-in form is usable separately. Compare cold and warm loads
under the same network conditions. Neither these changes nor fast loopback
timings prove that every browser-side bottleneck has been resolved.

## WebSocket and session checks

For this root deployment, the browser's alert socket must connect to
`wss://${HMDM_DOMAIN}/ws/alerts`, not `/home/fleet/ws/alerts`. The frontend URL
fix must be rebuilt into the server image; a proxy reload alone cannot fix the
JavaScript bundle. Test while signed in: a successful handshake shows HTTP 101
in the browser's Network panel. Check that the HTTPS server block has the
template's HTTP/1.1 and Upgrade/Connection directives, not only the port-80 block.

A 403 from `/rest/private/users/current` is an HTTP authentication/access error,
not a WebSocket handshake response. Try signing in again in a private window.
If it persists after a successful login, inspect the login response and cookie
storage/sending in the browser and capture `docker compose logs --tail=150 hmdm`.
Share statuses and cookie attributes only, never passwords or cookie values.
Do not disable authentication or expose private REST routes to resolve a 403.
