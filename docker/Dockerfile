# syntax=docker/dockerfile:1
# ===========================================================================
# Headwind MDM - DEV image.
#
# Stage 1 (build)   compiles the multi-module Maven project from the working
#                   copy in ./hmdm-server - i.e. YOUR edits, including the
#                   devicereset plugin we are about to write.
# Stage 2 (runtime) drops the resulting WAR onto Tomcat 9.
#
# The FROM lines pull *toolchain* images (Maven+JDK11, Tomcat) from Docker Hub.
# The Headwind source itself is never taken from a registry - it comes from
# the git checkout next to this file. For a build that clones straight from
# GitHub at a pinned tag instead, use docker/Dockerfile.git.
# ===========================================================================

# ---- Stage 1: build -------------------------------------------------------
FROM maven:3.9-eclipse-temurin-11 AS build
WORKDIR /src

# Dependencies persist in the BuildKit cache mount below, which survives --no-cache,
# so there is no separate warm-up step. There used to be one that copied the parent POMs
# ahead of the source and ran dependency:go-offline. It could never work: plugins/pom.xml
# declares ten child modules whose directories had not been copied yet, so Maven failed to
# read the reactor, the "|| true" swallowed it, and nothing was ever cached - it only
# printed ten alarming "Child module ... does not exist" lines on every build.
COPY hmdm-server /src
RUN [ -f server/build.properties ] || cp server/build.properties.example server/build.properties
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests install
RUN cp "$(ls server/target/*.war | head -1)" /ROOT.war

# ---- Stage 2: runtime -----------------------------------------------------
FROM tomcat:9-jdk11-temurin-jammy

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
RUN chmod +x /entrypoint.sh

EXPOSE 8080 31000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["catalina.sh", "run"]
