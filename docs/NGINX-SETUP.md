# Run Headwind behind existing Nginx

Keep Nginx on public ports 80/443 and forward only the MDM hostname to Headwind
on `127.0.0.1:8088`. Do not stop Nginx or change its other sites. This guide
assumes Nginx is installed directly on the VPS, not in another container or
managed by a hosting/mail control panel. For those setups, configure the proxy
through that system instead; container-local `127.0.0.1` is not the VPS host.

## Configure Headwind

Use the updated deployment scripts from this repository. In `.env`, above the
generated block, set:

```ini
DEPLOY_MODE=prod
HMDM_PROXY=external
HMDM_DOMAIN=mdm.maxcit.com
HMDM_HTTP_PORT=8088
```

Keep the existing SQL credentials and other settings. Replace the hostname if
needed. Port 8088 must be unused. Caddy's email and port settings are not used
in external mode. The public URL remains `https://mdm.maxcit.com` for QR codes
and APK downloads; this option does not configure Nginx or obtain a certificate.

From `~/hmdm-custom`, stop only the bundled Caddy service, then start Headwind:

```bash
docker compose --profile prod stop caddy
bash ./deploy.sh up
curl -I http://127.0.0.1:8088/
```

An already-running Caddy container is not stopped merely by disabling its
profile, which is why the explicit stop is necessary. Do not delete volumes.
No image rebuild is required. Allow time for Headwind startup before testing.

## Configure the MDM virtual host

Back up Nginx configuration before editing. Inspect the existing configuration:

```bash
sudo nginx -T 2>&1 | grep -n 'mdm.maxcit.com'
```

If the hostname already exists, edit its existing server block; do not add a
duplicate. Preserve working TLS certificate paths. Use the `location /` and
upload-size settings from `docker/nginx-hmdm.conf.example` inside its HTTPS
server block, keeping the HTTP-to-HTTPS redirect.

For a new hostname on Ubuntu/Debian using `sites-available`/`sites-enabled`, first
confirm `/etc/nginx/sites-available/hmdm` and `/etc/nginx/sites-enabled/hmdm` do
not already exist. Then:

```bash
sudo cp -n docker/nginx-hmdm.conf.example /etc/nginx/sites-available/hmdm
sudo nano /etc/nginx/sites-available/hmdm
sudo ln -s /etc/nginx/sites-available/hmdm /etc/nginx/sites-enabled/hmdm
sudo nginx -t
```

Confirm `server_name` and the `proxy_pass` port, and stop if the test fails.
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
sudo certbot --nginx -d mdm.maxcit.com --redirect
```

Enter the certificate contact email when prompted. Certbot modifies the matching
Nginx site to enable TLS. Review its changes, especially on a shared host. See
the [Certbot Nginx guide](https://eff-certbot.readthedocs.io/en/stable/using.html#nginx).
Do not install a second Certbot distribution if one is already installed.

```bash
sudo nginx -t
curl -I https://mdm.maxcit.com/
sudo certbot renew --dry-run
```

Open the HTTPS panel and test an uploaded APK download from a signed-out browser
on the devices' network. Verify QR URLs use `https://mdm.maxcit.com`, without
`:8088`. Do not enroll devices until HTTPS is valid. A 502 response usually means
Headwind is still starting, the proxy port differs from `HMDM_HTTP_PORT`, or the
proxy is in a container and cannot reach the host's loopback interface.
