# 💻 HMDM Frontend Developer Documentation

This document provides comprehensive instructions for frontend developers on how to run, work with, and create plugins (Microfrontends - MFEs) for the HMDM Frontend project. It also details the relevant backend build configuration for packaging frontend assets.

---

## 📋 Table of Contents

1. [General](#1-general)
2. [Project Structure](#2-project-structure)
3. [Port Allocations](#3-port-allocations)
4. [Getting Started](#4-getting-started)
5. [Creating a Plugin (MFE)](#5-creating-a-plugin-mfe)
6. [Maven Build Overview](#6-maven-build-overview)

---

## 1. General

### 1.1 Prerequisites

The following software versions are required to work with the project:

| Requirement | Version | Current  |
| :---------- | :------ | :------- |
| Angular     | 20      | 20.2.2   |
| Node        | 22      | v22.17.0 |
| PNPM        | 10      | 10.17.1  |

> 💡 **Note:** Using the exact versions listed above is recommended to avoid compatibility issues.

---

### 1.2 Development Environment

#### 1.2.1 IDE Recommendations

While any modern IDE or text editor will work, **Visual Studio Code** is the recommended choice for this project due to its excellent TypeScript and Angular support.

**Recommended VS Code Extensions:**

- **Angular Language Service** - Provides IntelliSense, error checking, and navigation for Angular templates
- **Angular Schematics** - Simplifies Angular CLI operations with a GUI
- **ESLint** - Integrates ESLint for code quality and style checking
- **Prettier** - Code formatter for consistent styling
- **GitLens** - Enhances Git capabilities within VS Code
- **Auto Rename Tag** - Automatically renames paired HTML/XML tags
- **Path Intellisense** - Autocompletes file paths

You can install these extensions from the VS Code Extensions marketplace or by searching for their names in the Extensions panel (Ctrl+Shift+X).

---

### 1.3 How the Project Works

#### 1.3.1 Architecture Overview

The HMDM Frontend project follows a **Microfrontend (MFE) architecture** using Angular Native Federation:

- **Core Application:** The main shell application that runs on port 4200 and orchestrates the entire UI
- **Plugins (MFEs):** Independent Angular applications that run on separate ports (4201, 4202, etc.) and are dynamically loaded into the core application
- **Shared UI Library:** The `hmdm-ui-kit` provides common components, styles, and utilities shared across the core and all plugins

**Key Concepts:**

- Each plugin is a standalone Angular workspace with its own dependencies
- Plugins expose components via Module Federation's `remoteEntry.json`
- The core application dynamically loads plugin routes and components at runtime
- Shared dependencies (Angular, Material, UI Kit) are loaded once from the host to reduce bundle size

#### 1.3.2 Development Workflow

When working on the frontend:

1. **Backend Must Be Running:** The frontend communicates with REST APIs, so a running backend server is required for full functionality
2. **Core App Must Be Running:** The core application acts as the host for all plugins
3. **Start Only Needed Plugins:** You only need to run the specific plugin(s) you're actively developing

**Example Workflow:**

```bash
# Terminal 1: Start the core application
cd server/src/main/web
pnpm run start

# Terminal 2: Start the plugin you're working on
cd plugins/{plugin-name}/src/main/web
pnpm run start
```

---

### 1.4 Hot Module Replacement & Auto-Reload

The development servers support **auto-reload**, providing a fast development experience:

- **Core Application:** Changes to TypeScript, HTML, or SCSS files trigger automatic recompilation and browser refresh
- **Plugins:** Each plugin dev server independently watches for changes and reloads
- **Live Updates:** When you modify files, you'll see changes reflected in the browser within seconds (typically 1-3 seconds)

**Performance Tips:**

- Keep only the necessary plugins running to reduce memory usage
- For major configuration changes, use `pnpm run start:clean` to clear caches

---

### 1.5 Debugging the Frontend

#### 1.5.1 Browser DevTools

**Chrome/Edge DevTools:**

1. Press `F12` or right-click → "Inspect" to open DevTools
2. Use the **Sources** tab to set breakpoints in TypeScript files
3. Use the **Console** tab to view logs and errors
4. Use the **Network** tab to inspect API calls and responses
5. Use the **Angular DevTools** extension for component inspection

> 💡 **Tip:** Install the [Angular DevTools Chrome Extension](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh) for advanced debugging features like component tree inspection, change detection profiling, and dependency injection hierarchy.

#### 1.5.2 VS Code Debugging

You can debug Angular applications directly in VS Code using the built-in debugger:

1. **Install the Debugger for Chrome/Edge extension** in VS Code
2. **Create a launch configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Core App",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}/server/src/main/web",
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Audit Plugin",
      "url": "http://localhost:4201",
      "webRoot": "${workspaceFolder}/plugins/audit/src/main/web"
    }
  ]
}
```

3. **Set breakpoints** in your TypeScript files
4. **Press F5** or select "Run → Start Debugging" to launch the browser with debugging enabled
5. **Step through code** using the Debug toolbar (F10 for step over, F11 for step into)

#### 1.5.3 Common Debugging Techniques

**Console Logging:**

```typescript
console.log("Debug value:", myVariable);
console.table(arrayOfObjects); // Display arrays as tables
console.trace(); // Show call stack
```

**Angular-Specific Debugging:**

```typescript
// Access component in console
ng.getComponent($0); // $0 is the selected element in DevTools

// Trigger change detection manually
ng.applyChanges($0);

// Get injector
ng.getInjector($0);
```

**MFE Debugging:**

```bash
# Check if remoteEntry.json is loaded
curl http://localhost:4201/remoteEntry.json
```

**Network Issues:**

- Check the Network tab for failed API calls (look for red entries)
- Inspect request/response headers and payloads
- Verify backend is running and accessible

**Performance Issues:**

- Use Chrome's Performance profiler to identify slow operations
- Check for excessive change detection cycles
- Use `OnPush` change detection strategy where appropriate

---

#### 1.5.4 Troubleshooting Tips

**Version Consistency:**

- **Angular and Native Federation versions MUST match exactly (major and minor)** across core and all plugins. Mismatched versions will cause runtime errors and module loading failures.
- Check resolved versions: `pnpm list @angular/core` and `pnpm list @angular-architects/native-federation`
- After changing versions in `package.json`, always delete `pnpm-lock.yaml` and run `pnpm install` to ensure clean dependency resolution

**Module Federation Errors:**

- "Shared module is not available for eager consumption" → Check that shared dependencies in `federation.config.js` have matching configurations between core and plugin
- "Cannot find remote entry" → Verify the MFE is running and the URL in environment files is correct
- Clear browser cache (Ctrl+Shift+Delete) if you see stale MFE content

**Common Gotchas:**

- Always restart dev servers after changing `federation.config.js` or environment files
- If styles aren't loading, check that `hmdm-ui-kit` is properly shared with `eager: false`
- Use `pnpm run start:clean` to clear Angular build cache if you encounter unexplainable errors
- Delete `node_modules`, `dist`, and `pnpm-lock.yaml` and run `pnpm install` for a fresh setup if issues persist

## 2. Project Structure

```
project-root/
├── server/
│   └── src/
│       └── main/
│           ├── web/                      # Core application Angular workspace
│           │   ├── projects/
│           │   │   ├── core/             # Main application
│           │   │   └── hmdm-ui-kit/      # Shared UI library
│           │   ├── angular.json
│           │   ├── package.json
│           │   └── tsconfig.json
│           └── java/                     # Backend code
│
├── plugins/
│   ├── audit/
│   │   └── src/
│   │       └── main/
│   │           ├── web/                  # Audit plugin Angular workspace
│   │           │   ├── projects/
│   │           │   │   └── audit/        # Audit plugin application
│   │           │   ├── angular.json
│   │           │   └── package.json
│   │           └── java/                 # Plugin backend code
│   │
│   └── {plugin_name}/
│       └── src/
│           └── main/
│               ├── web/                  # Your plugin Angular workspace
│               │   ├── projects/
│               │   │   └── {plugin_name}/
│               │   └── ...
│               └── java/
│
└── pom.xml                               # Root Maven configuration
```

---

## 3. Port Allocations

The following ports are currently allocated for development:

| Application                 | Port  | URL                       |
|:----------------------------|:------|:--------------------------|
| Core Application            | 4200  | http://localhost:4200     |
| Audit Plugin                | 4201  | http://localhost:4201     |
| Messaging Plugin            | 4202  | http://localhost:4202     |
| Logs Plugin                 | 4203  | http://localhost:4203     |
| Detailed Information Plugin | 4204  | http://localhost:4204     |
| Push Messages Plugin        | 4205  | http://localhost:4205     |
| More Plugins                | 4216  | http://localhost:4216     |
| _{Your New Plugin}_         | _TBD_ | _http://localhost:{port}_ |

> 💡 **Tip:** When creating a new plugin, choose an available port (e.g., 4202, 4203, etc.) and document it here to avoid conflicts.

---

## 4. Getting Started

> ⚠️ **Important:** A running backend is required to navigate the project.

### 4.1 Overview

There will be multiple applications running simultaneously during development:

- The **core application** (host) running on port 4200
- One or more **plugins (MFEs)** running on their allocated ports (e.g., 4201 for the audit plugin)
- The **backend server** (e.g., on port 8080) that serves APIs and the final WAR file for production.

For developing the frontend, you will primarily interact with the core application and the specific plugin(s) you're working on. The core application dynamically loads plugins at runtime, so you only need to start the plugins relevant to your current work.

> ⚠️ **Important:** Do NOT access the plugin URLs directly in the browser. Plugins aren't standalone. Always access the core application at `http://localhost:4200`, which will load the plugins dynamically based on the routing configuration.

> ⚠️ **Important:** Do NOT open the backend URL (e.g., `http://localhost:8080/launcher`) directly in the browser during development (unless you are testing production build), as it serves the production build. Use the Angular dev server at `http://localhost:4200` for development to take advantage of hot module replacement and faster builds.

### 4.2 Starting the Main Application

Run the following commands from the project root directory:

1. **Navigate to the web directory and install dependencies:**

```bash
   cd server/src/main/web
   pnpm install
```

2. **Start the application:**

```bash
   pnpm run start
```

This will start application in development mode at `http://localhost:4200`.

> ⚠️ **Note:** If you encounter errors, try running `pnpm run start:clean`

> ⚠️ **Note:** On Windows, stopping and starting the application may silently fail. A workaround
> would be: (1) gracefully stopping the app by the `q` command; (2) close the console and open another one;
> (3) use the parameter `NODE_OPTIONS="--max-old-space-size=32768"` (4) Kill the process `Microsoft Edge WebView2.

### 4.3 Starting a Plugin (MFE)

> ⚠️ **Important:** Running core app is required to work with any plugin.

> ⚠️ **Note:** Start only plugins you need to work on, no need to start all of them.

Run the following commands from the project root directory:

1. **Navigate to the plugin's web directory** (replace `{plugin_name}` with the actual folder name):

```bash
   cd plugins/{plugin_name}/src/main/web
```

2. **Install dependencies:**

```bash
   pnpm install
```

3. **Start the plugin:**

```bash
   pnpm run start
```

This will start the plugin in development mode at its allocated port (e.g., `http://localhost:4201` for the audit plugin).

> ⚠️ **Important:** Do not try to open the plugin URL directly in the browser. Always access the core application at `http://localhost:4200`, which will load the plugin dynamically.

#### 4.3.1 CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues when the core application tries to load a plugin, you can ignore them during development since frontend and backend are running on the same port in production.

To bypass CORS issues in development, you can use a browser extension like "Allow CORS: Access-Control-Allow-Origin" for Chrome or Firefox. Enable the extension while working on the project to allow cross-origin requests.

Alternatively, you can run a browser instance with web security disabled. To separate it from the standard instance, use a different user data directory.

##### 4.3.1.1 Windows

To run Chrome on Windows with CORS ignored, create a desktop shortcut that launches Chrome with the command-line flags --disable-web-security --user-data-dir. Right-click the desktop, select New > Shortcut, and enter the following as the location, replacing the Chrome path with your own: chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security. Or run the following command in the console:

```bash
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\Windows\temp\ChromeDev"
```

##### 4.3.1.2 Linux

To run Chrome on Linux with CORS ignored, open a terminal and execute the following command,

```bash
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_session"
```

Or

```bash
google-chrome-stable --disable-web-security --user-data-dir="/tmp/chrome_dev_session"
```

### 4.4 Starting the database

> ⚠️ **Important:** A running database is required to work with the backend.

You can use Docker to start a local instance of PostgreSQL database or connect to an existing one.

```bash
docker run --name hmdm_db \
    -e POSTGRES_USER=myuser \
    -e POSTGRES_PASSWORD=mypassword \
    -e POSTGRES_DB=hmdm \
    -p 5432:5432 \
    -v postgres_data:/var/lib/mdm/postgres/data \
    -d postgres:15
```

Once the database is running, you can populate it with initial data using a SQL dump file:

```bash
docker exec -it hmdm_db psql -U myuser -d hmdm -f /dump.sql
```

> 💡 **Note:** Ensure the `dump.sql` file is accessible inside the container. You may copy it into the container using the following command:

```bash
docker cp hmdm.sql hmdm_db:/path/to/dump.sql
```

Replace `/path/to/dump.sql` with the actual path to your SQL dump file on the host machine.

### 4.5 Starting the backend

To work with the frontend, a running backend is required. From the project root, run:

```bash
   git clone https://github.com/h-mdm/hmdm-server-v7
   cd hmdm-server-v7
   cp server/build.properties.example server/build.properties
   cp plugins/audit/build.properties.example plugins/audit/build.properties
```

Navigate to build.properties and set up your database connection details.

```bash
   mvn clean install
```

This will build a war file for backend. You can deploy it to your favorite servlet container (e.g., Tomcat) or run it using the embedded Jetty server:

> **Note:** This also includes the frontend, that can be accessed at `http://localhost:8080/launcher`, but for development purposes, use the Angular dev server at `http://localhost:4200`.

#### 4.5.1 Running in IntelliJ IDEA

1. Download and save [Apache Tomcat](https://tomcat.apache.org/download-90.cgi) 11 if you don't have it already.
2. Open the project in IntelliJ IDEA.
3. Click on the "More Actions(3 dots) -> Configurations/Edit" button in the top-right corner.
4. Click on the "+" button to add a new configuration and select "Tomcat -> Local".
5. In the "Configure" tab, set the "Tomcat Home" to the location where you saved Apache Tomcat.
6. In the "Deployment" tab, click on the "+" button and select "Artifact".
7. Select the war artifact (e.g., `server:war exploded`)
8. Set the application context to `/launcher`.
9. Click "Apply" and then "OK".
10. Click the "Run" button (green play icon) to start the backend server.

> 💡 **Note:** This should be done only once, later you can run the backend server without reconfiguring it using the green play icon.

Troubleshooting:

- If you encounter issues with ports already in use, ensure that no other instances of Tomcat or other applications are running on the same ports.
  Use `netstat -tlnp` to check for active ports and identify any conflicts.

- If you face issues with database connectivity, double-check your `application.properties` file for correct database URL, username, and password.
- Try to connect to the database using a database client to ensure it's accessible.
- If the issue persists check the tomcat folder conf/Catalina/localhost/launcher.xml for any misconfigurations.
- If file is missing, create it with the content of application.properties

#### 4.5.2 Other Methods

TODO, add instructions to run backend using command line or other IDEs

---

### 4.6 Building the Frontend for Production

From the project root directory, run the following command to build the core application and all plugins for production:

```bash
  mvn clean install
```

This command will generate optimized production builds and package them into the final WAR file located at `android-kiosk-web/target/launcher.war`.

> 💡 **Note:** You need servlet container to run access this file

## 5. Creating a Plugin (MFE)

### 5.1 Bootstrap the Project

From the root of the project, execute the following commands:

1. **Navigate to the new plugin's source directory:**

```bash
   cd plugins/{plugin_name}/src/main
```

2. **Create a new workspace without a root application:**

```bash
   ng new web --create-application=false
```

3. **Generate the Angular application for the plugin:**

```bash
   ng generate application {plugin_name}
```

4. **Add Angular Architects Module Federation:**

```bash
   ng add @angular-architects/module-federation --project {plugin_name} --port {plugin_port}
```

5. **Select stack type**

Select "Native Federation with esbuild (bundler-agnostic)" when prompted for the stack type.

- **Replace** `{plugin_name}` with the actual plugin folder name
- **Replace** `{plugin_port}` with any available port (see [Port Allocations](#3-port-allocations))
- **Remember** to update the Port Allocations table with your new port

### 5.2 Configure TypeScript

Include the path to the UI library `hmdm-ui-kit` in the `paths` section of the `tsconfig.json` file in the plugin's web directory root:

```json
{
  "compilerOptions": {
    "paths": {
      "hmdm-ui-kit": ["../../../../../server/src/main/web/projects/hmdm-ui-kit/src/public-api"]
    }
  }
}
```

### 5.3 Configure Microfrontend (MFE)

Configure the `federation.config.js` file located in `projects/{plugin_name}` to define the MFE as an Angular Native Federation Remote.

#### Example Configuration

```javascript
const { withNativeFederation, shareAll } = require("@angular-architects/native-federation/config");

module.exports = withNativeFederation({
  name: "plugin_name", // Replace with your plugin name

  exposes: {
    "./plugin_name": "./projects/plugin_name/src/app/app.ts", // Entry point for your plugin
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: "auto" }),

    "@angular/material": {
      singleton: true,
      strictVersion: false,
      requiredVersion: "auto",
      eager: false,
    },

    "hmdm-ui-kit": {
      singleton: true,
      strictVersion: false,
      requiredVersion: "auto",
      eager: false, // Import from host (core application)
    },
  },

  skip: ["rxjs/ajax", "rxjs/fetch", "rxjs/testing", "rxjs/webSocket"],
});
```

#### Configuration Breakdown

| Property              | Description                                                                                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **name**              | The unique identifier for your plugin (must match the plugin folder name).                                                                                    |
| **exposes**           | Defines the module(s) that this MFE exposes to the core application. The key (e.g., `'./plugin_name'`) is used in the routing configuration.                  |
| **shared**            | Specifies which dependencies are shared between the core application and the plugin to avoid duplication.                                                     |
| **shareAll()**        | Automatically shares all dependencies with singleton pattern and strict versioning.                                                                           |
| **@angular/material** | Angular Material components are shared as singletons to ensure consistent styling and behavior.                                                               |
| **hmdm-ui-kit**       | The shared UI library is imported from the host (core application) to maintain consistency across all plugins. Set `eager: false` to lazy-load from the host. |
| **skip**              | Lists dependencies that should NOT be shared (typically testing utilities and specialized RxJS modules).                                                      |

#### Important Notes

- Even so we use shareAll the angular material and ui library must be shared explicitly to avoid errors
- **Replace** `plugin_name` in both the `name` field and `exposes` key with your actual plugin folder name
- **Replace** the path in `exposes` to point to your plugin's main entry file (typically `app.ts` or `app.component.ts`)
- The `exposes` key (e.g., `'./plugin_name'`) must match what you use in `loadRemoteModule()` in the routing configuration
- Always set `hmdm-ui-kit` with `eager: false` to ensure it's loaded from the host application, maintaining a single source of truth for UI components

### 5.4 Register the Route in plugin's web application

Navigate to `plugins/{plugin-name}/src/main/web` and setup the routing for your plugin. :

Example routing configuration for the plugin's Angular application:

```typescript
export const MFE_ROUTES: Routes = [
  {
    path: "",
    component: App, // Replace with the actual component class exposed by your plugin MFE
    children: [
      { path: "", redirectTo: "main", pathMatch: "full" },
      {
        path: "main",
        loadComponent: () => import("./pages/main/main").then((m) => m.Main), // Replace with the actual path and component class for your plugin's main page
      },
      {
        path: "settings",
        loadComponent: () => import("./pages/settings/settings").then((m) => m.Settings), // Replace with the actual path and component class for your plugin's settings page if applicable
      },
    ],
  },
];
```

- **Replace** `plugin_name` with the actual plugin folder name
- **Replace** `ClassName` with the actual name of the component class exposed by the plugin MFE

> ⚠️ **Important:** Make sure the object is exported as MFE_ROUTES
> ⚠️ **Important:** No need to register the route in the app.config.ts of the plugin, the core application will automatically discover and load the plugin's `remoteEntry.json` at runtime, making the exposed components available based on the routing configuration in the plugin's own Angular application.

### 5.5 Add plugin to the database

To make the plugin available in the core application, you need to add an entry for it in the database. This is typically done by inserting a new record into the `plugins` table with the appropriate details (e.g., name, description, route path).

---

## 6. Maven Build Overview

The project uses Maven (`pom.xml`) and the `frontend-maven-plugin` to integrate the Angular build process with the Java backend packaging (JAR/WAR).

### 6.1 Plugin Build Process

The plugin's `pom.xml` is responsible for building a self-contained JAR that includes the compiled frontend MFE.

| Build Step       | Maven Plugin             | Action                                                                                                                                                |
| :--------------- | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Setup/Clean**  | `maven-clean-plugin`     | Cleans the temporary build directory (`src/main/webtarget`) before and after the build.                                                               |
| **Copy Source**  | `maven-resources-plugin` | Copies the Angular source code (`src/main/web`) to `src/main/webtarget` for the build process.                                                        |
| **Dependencies** | `frontend-maven-plugin`  | Installs Node, PNPM, and runs `pnpm install` in `src/main/webtarget`.                                                                                 |
| **Build MFE**    | `frontend-maven-plugin`  | Runs the Angular build command (`pnpm run build --configuration production`) to generate production MFE files.                                        |
| **Packaging**    | `maven-resources-plugin` | Copies the built frontend files (`dist/{plugin_name}/browser`) into the final JAR location: `target/classes/META-INF/resources/plugins/{plugin_name}` |

### 6.2 Core Application Build Process

The core application's `pom.xml` builds the main WAR file, which includes the core application frontend and consolidates all plugin MFEs.

| Build Step            | Maven Plugin                                   | Action                                                                                                                                                                                                                                 |
| :-------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Copy/Build Core**   | `frontend-maven-plugin`, `maven-antrun-plugin` | Builds the core Angular application and copies the compiled files (`dist/core/browser`) into the final WAR structure at `target/launcher`.                                                                                             |
| **MFE Extraction**    | `maven-dependency-plugin`                      | Extracts the MFE assets from all plugin JAR dependencies (included with `scope: runtime`). Pulls files from `META-INF/resources/**` into a staging directory (`target/plugin-resources`).                                              |
| **MFE Consolidation** | `maven-antrun-plugin`                          | Copies the extracted MFE assets from the staging directory into the final WAR structure at `target/launcher`. This makes all plugins' `remoteEntry.json` files available at runtime (e.g., `launcher/plugins/audit/remoteEntry.json`). |

---

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Module Federation Documentation](https://www.angulararchitects.io/en/blog/the-microfrontend-revolution-module-federation-in-webpack-5/)
- [PNPM Documentation](https://pnpm.io/)

---

**Last Updated:** August 2026
