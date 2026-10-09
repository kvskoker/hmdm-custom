# Building the Headwind MDM Web Console 

This instruction has been tested on Ubuntu Linux 24.04 LTS.

You need a server or virtual machine having at least 4Gb RAM (8Gb recommended).

## Build instructions

### 1. Install required software

    sudo apt update
    sudo apt install -y tomcat10 maven postgresql certbot

### 2. Create the PostgreSQL database and user

    sudo su - postgres
    psql
    postgres=# CREATE USER hmdm WITH PASSWORD 'topsecret';
    postgres=# CREATE DATABASE hmdm WITH OWNER=hmdm;
    postgres=# \q
    exit

*If you get "Connection refused" error, fix the Tomcat installation issues.*

### 3. Clone the repository

    git clone https://github.com/h-mdm/hmdm-server-v7
    cd hmdm-server-v7

### 4. Create the properties file from the sample

    cp server/build.properties.example server/build.properties
    cp plugins/audit/build.properties.example plugins/audit/build.properties

Update the contents of the server/build.properties file.

### 5. Build the source code

    mvn install

Note: this command takes a long time because of the front-end build.
Subsequent builds will be much faster if only back-end is changed.

For front-end development, use the workflow explained in the 
FRONTEND_DEV_GUIDE.md (section 4 "Getting Started"). In short:
 - Use pnpm command-line tools and Visual Studio Code for debugging.
 - Once the debugging is done, use Maven for building the production release.

To avoid including debug info in the production release, use the command 
(in the plugin or server directory):

    mvn clean -Pfrontend

### 6. Deploy the built artifact 

Notice: ***To deploy Headwind MDM, you need a static IP address and a domain name.** 
We do not recommend running the deployment script on a laptop or developer's
computer using `127.0.0.1`. For development purposes, deploy the software
on an Internet-based host, then dump the database and copy it to the 
developer machine.*

Run the installer script (as root)

    sudo ./hmdm_install.sh

This script will deploy the compiled WAR file, configure the web application,
and install the HTTPS certificate using Let's Encrypt.

### 8. You're all set!

On success, the installer script provides you with the URL. Open 
Headwind MDM in browser (use `admin:admin` for the first sign-in and 
change the password to a stronger one).

