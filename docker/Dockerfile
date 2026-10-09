# ===========================================================================
# Headwind MDM - DEV image.
#
# Stage 1 (build)   compiles the multi-module Maven project from the working
#                   copy in ./hmdm-server - i.e. YOUR edits, including the
#                   custom fleet-management plugins.
# Stage 2 (runtime) deploys the WAR and shared libraries onto Tomcat 11.
#
# The FROM lines pull toolchain images (Maven+JDK21, Tomcat) from Docker Hub.
# The Headwind source itself is never taken from a registry - it comes from
# the git checkout next to this file. For a build that clones straight from
# GitHub at a pinned tag instead, use docker/Dockerfile.git.
# ===========================================================================

# ---- Stage 1: build -------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
ENV npm_config_store_dir=/.pnpm-store \
    npm_config_fetch_timeout=120000 \
    npm_config_fetch_retries=2 \
    npm_config_network_concurrency=8

# Dependencies persist in the BuildKit cache mount below, which survives --no-cache,
# so there is no separate warm-up step. There used to be one that copied the parent POMs
# ahead of the source and ran dependency:go-offline. It could never work: plugins/pom.xml
# declares ten child modules whose directories had not been copied yet, so Maven failed to
# read the reactor, the "|| true" swallowed it, and nothing was ever cached - it only
# printed ten alarming "Child module ... does not exist" lines on every build.
COPY hmdm-server /src
COPY docker/cache-node.sh /tmp/cache-node.sh
RUN --mount=type=cache,target=/root/.m2 sed -i 's/\r$//' /tmp/cache-node.sh && sh /tmp/cache-node.sh
RUN [ -f server/build.properties ] || cp server/build.properties.example server/build.properties
RUN [ -f plugins/audit/build.properties ] || cp plugins/audit/build.properties.example plugins/audit/build.properties
RUN --mount=type=cache,target=/root/.m2 \
    --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/root/.local/share/pnpm \
    --mount=type=cache,target=/.pnpm-store \
    mvn -B -ntp install
RUN cp "$(ls server/target/*.war | head -1)" /ROOT.war

# ---- Stage 2: runtime -----------------------------------------------------
FROM tomcat:11.0.24-jdk21-temurin-noble

RUN apt-get update \
 && apt-get install -y --no-install-recommends aapt postgresql-client curl \
 && rm -rf /var/lib/apt/lists/*

ENV HMDM_BASE=/opt/hmdm \
    SQL_HOST=db SQL_PORT=5432 SQL_BASE=hmdm SQL_USER=hmdm SQL_PASS=topsecret \
    PROTOCOL=http BASE_HOST=localhost:8080 BASE_DOMAIN=10.0.2.2 BASE_PATH= \
    LANGUAGE=en \
    SMTP_HOST= SMTP_PORT=25 SMTP_SSL=0 SMTP_STARTTLS=0 \
    SMTP_USERNAME= SMTP_PASSWORD= SMTP_FROM=

RUN mkdir -p /usr/local/tomcat/conf/Catalina/localhost $HMDM_BASE/files $HMDM_BASE/plugins

COPY --from=build /ROOT.war            /usr/local/tomcat/webapps/ROOT.war
COPY --from=build /src/target/shared-libs/ /usr/local/tomcat/lib/

# The bootstrap-css-only package ships bootstrap.css with a trailing
# "sourceMappingURL=bootstrap.css.map" comment but not the .map file itself, so every
# browser with devtools open asks for a file that was never there and logs a 404. That
# comment is the only thing pointing at it - strip it and the request stops being made.
# Repacking the war rather than exploding it keeps the deployment shape unchanged.
RUN set -e; \
    mkdir -p /tmp/war && cd /tmp/war \
 && jar xf /usr/local/tomcat/webapps/ROOT.war \
 && find . -name '*.css' -exec sed -i '/sourceMappingURL/d' {} + \
 && jar cf /usr/local/tomcat/webapps/ROOT.war . \
 && cd / && rm -rf /tmp/war
COPY --from=build /src/install         /opt/hmdm-install
COPY docker/entrypoint.sh              /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8080 31000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["catalina.sh", "run"]
