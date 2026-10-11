#!/usr/bin/env sh
# Isolated test-image overlay only. Run inside the existing v7 image with /src
# mounted read-only. Production must use the normal Maven Docker build.
set -eu
mkdir -p /tmp/register-web /tmp/register-classes /tmp/register-common
cd /tmp/register-web
jar xf /usr/local/tomcat/webapps/ROOT.war
javac -proc:none -cp '/usr/local/tomcat/lib/*:/tmp/register-web/WEB-INF/lib/*:/tmp/register-web/WEB-INF/classes' \
  -d /tmp/register-classes \
  /src/hmdm-server/common/src/main/java/com/hmdm/persistence/domain/DeviceSearchRequest.java \
  /src/hmdm-server/common/src/main/java/com/hmdm/persistence/mapper/DeviceRegisterMapper.java \
  /src/hmdm-server/common/src/main/java/com/hmdm/persistence/DeviceRegisterDAO.java \
  /src/hmdm-server/server/src/main/java/com/hmdm/rest/resource/DeviceRegisterResource.java \
  /src/hmdm-server/server/src/main/java/com/hmdm/rest/resource/UserRoleResource.java
cd /tmp/register-common
jar xf /tmp/register-web/WEB-INF/lib/common-0.1.0.jar
cp -r /tmp/register-classes/com/hmdm/persistence com/hmdm/
cp /src/hmdm-server/common/src/main/java/com/hmdm/persistence/mapper/DeviceMapper.xml com/hmdm/persistence/mapper/
jar cf /tmp/register-web/WEB-INF/lib/common-0.1.0.jar .
cd /tmp/register-web
cp -r /tmp/register-classes/com/hmdm/rest/resource/DeviceRegisterResource* WEB-INF/classes/com/hmdm/rest/resource/
cp /tmp/register-classes/com/hmdm/rest/resource/UserRoleResource.class WEB-INF/classes/com/hmdm/rest/resource/
cp /src/hmdm-server/server/src/main/resources/liquibase/db.changelog.xml WEB-INF/classes/liquibase/
cp -r /src/hmdm-server/server/src/main/web/dist/core/browser/. .
jar cf /usr/local/tomcat/webapps/ROOT.war .
