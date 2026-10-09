# Headwind MDM - Open Source Android Device Management Platform

Start managing your company's fleet of mobile devices in minutes. Install 
business apps, configure policies and restrictions, and monitor device 
status. The platform is the perfect choice for corporate Android solution 
developers and businesses with field workers or those managing standalone 
Android devices.

(c) 2026 [h-mdm.com](https://h-mdm.com)

## Why choose Headwind MDM?

 - Autonomous, self-hosted, and secure MDM platform.
 - Fast deployment and a straightforward device management workflow.
 - Open source server and mobile agent.
 - Works in closed (air-gapped) networks.
 - Designed for Android Enterprise and AOSP devices.
 - Integrates with custom AOSP ROMs.

## What's new in version 7?

In this major release, we have updated the technology stack by migrating 
to modern, actively maintained platforms and libraries:
 - Java (OpenJDK 21)
 - Tomcat 10+
 - Angular

**Improved Plugin system.** In this version, plugins can be developed 
and packaged as standalone WAR files, eliminating the need to rebuild 
the entire project for each custom plugin. Developers can create new 
plugins using the Community Edition and distribute them to Enterprise 
customers.

**Alerts.** The web console now receives backend alerts over 
WebSockets and displays them instantly as pop-up notifications.

**Shared libraries.** Most libraries used by Headwind MDM are now 
deployed in the Tomcat `lib` directory, significantly reducing the 
size of web application updates.

## Quick start

The recommended operating system for the deployment of Headwind MDM is
Ubuntu Linux (24.04 LTS).

Here's the deployment workflow:

- Clone the project and build it (see BUILD.txt for details)
- Deploy the built artifact to Tomcat using the installer script
- Sign in to the web panel and generate a provisioning QR code
- Factory-reset your Android device and tap the welcome screen 6 times
- Scan the QR code to install the Headwind MDM mobile agent

## How to migrate from version 5?

If you're on Ubuntu Linux, simply run the script

    migrate.sh

which does everything. It installs Tomcat 11, updates the web console and 
shell scripts.

***IMPORTANT: TAKE A BACKUP OF YOUR HEADWIND MDM INSTANCE BEFORE MIGRATION!***

## Features

 - QR-code-based provisioning of Android 7+ devices
 - Silent installation and updating of mobile applications
 - Operation in foreground (managed launcher) and background (agent) modes
 - Management of device policies (GPS, Wi-Fi, Bluetooth etc.) and restrictions
 - Device status monitoring
 - Collection of device information
 - Autonomous push notification system
 - Device management through push commands
 - Managed application configurations
 - Collection of application logs
 - Integration with third-party mobile apps
 - Extensible platform architecture allowing custom plugin development
 - REST API

The **Enterprise edition** of the platform provides additional features:

 - Restriction of available apps and settings (a "kid's shell" for employees)
 - Kiosk mode (COSU, single-task mode)
 - Running web applications in kiosk mode
 - Remote reboot, lock, and factory reset
 - Bulk device setup (import and export of device lists)
 - Device location tracking
 - Contact management
 - Collection of photos and other files from mobile devices (proof of work)
 - Remote control and screen mirroring
 - URL filtering and ad blocking
 - Two-factor authentication
 - Multi-tenant operation
 - Self-signup
 - LDAP-based user authentication
 - Rebranding
 - Cloud-based automatic generation of platform-signed builds

More details here: https://h-mdm.com/headwind-mdm-version-comparison/

If you're interested in the Enterprise license, please [contact the sales team](https://h-mdm.com/contact-us).

## Feedback

### Setup inquiries and how-tos

If you're struggling with the system setup, take a look at our Q&A forum: https://qa.h-mdm.com. 

The forum is indexed by Google and AI. If you can't find an answer to your question, sign up and
submit your question on the forum.

### Bug reports, feature requests, and security issues

Please report bugs, request for new features, and submit security issues
and vulnerabilities on [Headwind MDM website](https://h-mdm.com/contact-us) 
or [GitHub](https://github.com/h-mdm/hmdm-server-v7/issues).

## Contributing

Headwind MDM team acknowledges our contributors. To ensure your efforts to be processed as quickly as possible, we kindly ask you to follow these rules.

 - Contact us and send us the contribution request

**IMPORTANT: Pull requests without prior consent to contribution will be rejected!**

 - Clone and build the project, test it by granting device owner permissions by the adb utility.
 - Pull the changes to the repository as a contributor branch
 - Submit a pull request.

**IMPORTANT: please provide the commit description:**

    – Which use case or feature is covered
    – Testing instructions

**Please do not merge multiple features into one commit unless agreed with 
our team. Each feature or bugfix is reviewed independently, so merging 
multiple features into one commit makes this process difficult to manage.**

 - Once accepted, the new feature will become available in the next release (2-4 weeks).


