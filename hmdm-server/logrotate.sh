#!/bin/bash
#
# Weekly log rotation utility for Headwind MDM
#
TOMCAT_HOME=$(ls -d /var/lib/tomcat* | tail -n1)

find $TOMCAT_HOME/work/logs -name "hmdm.log.*" -mtime +7 -exec rm {} \;
find $TOMCAT_HOME/work/logs -name "audit.log.*" -mtime +7 -exec rm {} \;

# Uncomment if you need to rotate catalina.out as well
#rm $BASE_DIR/catalina.out.1
#mv $BASE_DIR/catalina.out $BASE_DIR/catalina.out.1
#service tomcat9 restart
