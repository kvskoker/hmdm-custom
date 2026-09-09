#!/bin/bash
# Renders the Headwind MDM Tomcat context from the upstream template
# (install/context_template.xml), seeds the database on first run, starts Tomcat.
set -e

CTX=/usr/local/tomcat/conf/Catalina/localhost/ROOT.xml
INSTALL_FLAG=$HMDM_BASE/install.flag

echo "[hmdm] waiting for postgres at $SQL_HOST:$SQL_PORT ..."
until pg_isready -h "$SQL_HOST" -p "$SQL_PORT" -U "$SQL_USER" >/dev/null 2>&1; do sleep 1; done
echo "[hmdm] postgres is up"

sed "s|_BASE_DIRECTORY_|$HMDM_BASE|g" \
    /opt/hmdm-install/log4j_template.xml > "$HMDM_BASE/log4j-hmdm.xml"
cp -r /opt/hmdm-install/emails "$HMDM_BASE/" 2>/dev/null || true

if [ ! -f "$CTX" ] || [ -n "$FORCE_RECONFIGURE" ]; then
  sed "s|_SQL_HOST_|$SQL_HOST|g;   s|_SQL_PORT_|$SQL_PORT|g;
       s|_SQL_BASE_|$SQL_BASE|g;   s|_SQL_USER_|$SQL_USER|g;
       s|_SQL_PASS_|$SQL_PASS|g;   s|_BASE_DIRECTORY_|$HMDM_BASE|g;
       s|_PROTOCOL_|$PROTOCOL|g;   s|_BASE_HOST_|$BASE_HOST|g;
       s|_BASE_DOMAIN_|$BASE_DOMAIN|g; s|_BASE_PATH_|$BASE_PATH|g;
       s|_INSTALL_FLAG_|$INSTALL_FLAG|g; s|_LANGUAGE_|$LANGUAGE|g;
       s|_SMTP_HOST_|$SMTP_HOST|g; s|_SMTP_PORT_|$SMTP_PORT|g;
       s|_SMTP_SSL_|$SMTP_SSL|g;   s|_SMTP_STARTTLS_|$SMTP_STARTTLS|g;
       s|_SMTP_USERNAME_|$SMTP_USERNAME|g; s|_SMTP_PASSWORD_|$SMTP_PASSWORD|g;
       s|_SMTP_FROM_|$SMTP_FROM|g;" \
      /opt/hmdm-install/context_template.xml > "$CTX"

  # Bind MQTT to an address this container's NIC actually holds. Binding to a
  # hostname that resolves to a NAT/public address fails with
  # "Cannot assign requested address" and the broker never starts.
  sed -i "s|<Parameter name=\"mqtt.server.uri\".*|<Parameter name=\"mqtt.server.uri\" value=\"${MQTT_BIND:-0.0.0.0}:31000\"/>|" "$CTX"
  sed -i "s|<Parameter name=\"mqtt.auth\".*|<Parameter name=\"mqtt.auth\" value=\"${MQTT_AUTH:-0}\"/>|" "$CTX"

  # Behind a reverse proxy every request arrives from the proxy, so without
  # these two the panel logs the proxy's address as the device's. They are
  # commented out in the upstream template; injected here only when set, which
  # deploy.sh does in production and leaves empty in dev.
  if [ -n "${PROXY_ADDRESSES:-}" ]; then
    sed -i "s|</Context>|    <Parameter name=\"proxy.addresses\" value=\"${PROXY_ADDRESSES}\"/>\n    <Parameter name=\"proxy.ip.header\" value=\"${PROXY_IP_HEADER:-X-Real-IP}\"/>\n</Context>|" "$CTX"
    echo "[hmdm] reverse proxy: trusting ${PROXY_ADDRESSES}, client IP from ${PROXY_IP_HEADER:-X-Real-IP}"
  fi

  echo "[hmdm] wrote $CTX"
fi

# --- first-run database seed --------------------------------------------------
# Liquibase builds the schema when the webapp deploys, so the seed cannot run
# before Tomcat. The app writes $INSTALL_FLAG once initialization completes -
# wait for that signal in the background, then apply the seed once.
export PGPASSWORD="$SQL_PASS"
SEED_MARKER="$HMDM_BASE/.seeded"

seed_when_ready() {
  for _ in $(seq 1 150); do
    [ -f "$INSTALL_FLAG" ] && break
    sleep 2
  done
  if [ ! -f "$INSTALL_FLAG" ]; then
    echo "[hmdm] app never signalled initialization - skipping seed"
    return
  fi
  echo "[hmdm] seeding database from install/sql/hmdm_init.$LANGUAGE.sql"
  sed "s|_HMDM_BASE_|$HMDM_BASE|g; s|_HMDM_VERSION_|${CLIENT_VERSION:-6.39}|g;
       s|_HMDM_APK_|${CLIENT_APK:-}|g; s|_ADMIN_EMAIL_|${ADMIN_EMAIL:-admin@localhost}|g;" \
      "/opt/hmdm-install/sql/hmdm_init.$LANGUAGE.sql" > /tmp/hmdm_init.sql
  if psql -h "$SQL_HOST" -p "$SQL_PORT" -U "$SQL_USER" -d "$SQL_BASE" \
          -v ON_ERROR_STOP=0 -f /tmp/hmdm_init.sql; then
    touch "$SEED_MARKER"
    echo "[hmdm] seed applied"
  else
    echo "[hmdm] seed reported errors - see above"
  fi

  # The upstream seed registers a launcher version that points at the public Headwind
  # download. With CLIENT_APK unset that URL is a bare directory, so it is not a file at
  # all - and the row still occupies (com.hmdm.launcher, 6.39), which is exactly the
  # version your own build wants. Uploading it then fails with "APK for this version
  # already exists". Move the placeholder out of the way instead of making that your
  # problem to discover.
  # The upstream seed registers several applications hosted on h-mdm.com: the
  # launcher itself, plus the Pager, PhoneProxy and LauncherRestarter helpers.
  # This deployment must not depend on anyone else's download server, and the
  # launcher row additionally occupies (com.hmdm.launcher, 6.39) - the version
  # your own build wants, so uploading it fails with "already exists".
  #
  # Both problems go away by moving those rows out of the way. Nothing is
  # deleted: the rows stay visible in the Applications list, renamed, so it is
  # obvious what happened rather than apps silently vanishing.
  # The URL is blanked as well as the version renamed. Renaming alone is not
  # enough: a configuration's main app still points at the parked row, and the
  # QR endpoint hashes the main app's APK before it can build the payload. With
  # the h-mdm.com URL left in place that hash attempt fetches a bare directory,
  # gets 403, and the whole QR request fails with a 500 that says nothing about
  # the real cause. A blank URL is the "no APK yet" state the code already
  # understands, so the failure stays legible until you upload your own build.
  psql -h "$SQL_HOST" -p "$SQL_PORT" -U "$SQL_USER" -d "$SQL_BASE" -v ON_ERROR_STOP=0 -c \
    "UPDATE applicationversions SET version = version || '-upstream', url = '' \
     WHERE url LIKE 'https://h-mdm.com/%' AND version NOT LIKE '%-upstream';" \
    >/dev/null 2>&1 \
    && echo "[hmdm] upstream-hosted app versions parked"

  echo "[hmdm] NEXT STEP: upload your launcher APK in Applications and set it as"
  echo "[hmdm]            the main app of a configuration. QR enrollment cannot"
  echo "[hmdm]            work until you do - the QR payload carries that APK's"
  echo "[hmdm]            download URL and checksum."
}

if [ ! -f "$SEED_MARKER" ]; then
  seed_when_ready &
else
  echo "[hmdm] database already seeded"
fi

rm -f "$INSTALL_FLAG"
echo "[hmdm] starting tomcat - panel at ${PROTOCOL}://${BASE_HOST}${BASE_PATH}"
exec "$@"
