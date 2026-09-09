<#
  Walks the device-location chain and reports which link is broken.

  Run it from the hmdm-dev folder, with the emulator running:
      powershell -ExecutionPolicy Bypass -File .\diagnose-location.ps1

  Optional: give it a position to inject and a device number to check.
      .\diagnose-location.ps1 -Lat 8.4844 -Lon -13.2299 -Device Test001

  The chain it checks, in order. The first FAIL is the one that matters.
    1. adb sees the emulator
    2. the launcher holds the location permissions
    3. location is switched on and a provider is enabled
    4. the OS actually has a fix to give (this is what an emulator usually lacks)
    5. the server is telling the device to collect one (requestUpdates)
    6. positions have reached the database
#>

param(
    [double] $Lat = 8.4844,          # Freetown, so the marker lands somewhere recognisable
    [double] $Lon = -13.2299,
    [string] $Device = "",
    [switch] $SkipGeoFix
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Cyan }
function Pass($t) { Write-Host "  PASS  $t" -ForegroundColor Green }
function Fail($t) { Write-Host "  FAIL  $t" -ForegroundColor Red }
function Note($t) { Write-Host "        $t" -ForegroundColor DarkGray }

$pkg = "com.hmdm.launcher"

# --- 1. adb -----------------------------------------------------------------------
Head "1. Emulator"
$adb = (Get-Command adb -ErrorAction SilentlyContinue)
if (-not $adb) {
    $sdk = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $sdk) { $adb = $sdk } else {
        Fail "adb not found. Add platform-tools to PATH, or run this from that folder."
        exit 1
    }
} else { $adb = $adb.Source }

$devices = & $adb devices | Select-String "device$"
if (-not $devices) { Fail "No device. Start the emulator and re-run."; exit 1 }
Pass "adb sees: $($devices -join ', ')"

$installed = & $adb shell pm list packages $pkg
if (-not $installed) { Fail "$pkg is not installed on this device."; exit 1 }
Pass "$pkg is installed"

# --- 2. permissions ---------------------------------------------------------------
Head "2. Location permissions"
$dump = & $adb shell dumpsys package $pkg
$coarse = $dump | Select-String "ACCESS_COARSE_LOCATION: granted=true"
$fine   = $dump | Select-String "ACCESS_FINE_LOCATION: granted=true"

if ($coarse) { Pass "ACCESS_COARSE_LOCATION granted" } else {
    Fail "ACCESS_COARSE_LOCATION NOT granted"
    Note "This alone stops everything: LocationService gives up and stops silently."
    Note "Grant it with:  adb shell pm grant $pkg android.permission.ACCESS_COARSE_LOCATION"
}
if ($fine) { Pass "ACCESS_FINE_LOCATION granted" } else {
    Fail "ACCESS_FINE_LOCATION NOT granted - GPS mode silently falls back to network only"
    Note "Grant it with:  adb shell pm grant $pkg android.permission.ACCESS_FINE_LOCATION"
}

# --- 3. location switched on ------------------------------------------------------
Head "3. Location services"
$mode = (& $adb shell settings get secure location_mode).Trim()
if ($mode -eq "0" -or $mode -eq "null") {
    Fail "Location is OFF on the device (location_mode=$mode)"
    Note "Turn it on with:  adb shell settings put secure location_mode 3"
} else { Pass "Location is on (location_mode=$mode)" }

$providers = (& $adb shell settings get secure location_providers_allowed).Trim()
Note "Providers allowed: $providers"

# --- 4. is there a fix at all -----------------------------------------------------
Head "4. A position for the launcher to read"
if (-not $SkipGeoFix) {
    Note "Injecting a fix at $Lat, $Lon ..."
    # 'geo fix' takes LONGITUDE first. Extended Controls > Location > Set does the same
    # thing, but this way there is no doubt it was actually applied.
    $consolePort = ((& $adb devices | Select-String "emulator-(\d+)").Matches.Groups[1].Value)
    if ($consolePort) {
        & $adb emu geo fix $Lon $Lat 2>&1 | Out-Null
        Start-Sleep -Seconds 2
        Note "Sent: adb emu geo fix $Lon $Lat"
    } else {
        Note "Not an emulator - skipping injection, relying on the real fix."
    }
}

$loc = & $adb shell dumpsys location
$lastKnown = $loc | Select-String "last location|Last Known|lat=|latitude" | Select-Object -First 8
if ($lastKnown) {
    Pass "The OS has location data:"
    $lastKnown | ForEach-Object { Note $_.ToString().Trim() }
} else {
    Fail "No last-known location anywhere in dumpsys."
    Note "The launcher reports getLastKnownLocation(), so with no fix it sends nothing."
    Note "In the emulator: Extended controls (...) > Location > set coordinates > SET."
}

# --- 5. is the server asking for it -----------------------------------------------
Head "5. Server side"
$compose = Test-Path ".\docker-compose.yml"
if (-not $compose) {
    Note "Run this from the hmdm-dev folder to include the database checks."
} else {
    $sql = @"
SELECT d.number,
       COALESCE(c.requestUpdates,'(none)') AS tracking,
       to_timestamp(d.lastUpdate/1000)::timestamp(0) AS last_sync,
       (SELECT COUNT(*) FROM plugin_devicelocation_point p WHERE p.deviceId=d.id) AS points,
       (SELECT to_timestamp(MAX(p.ts)/1000)::timestamp(0) FROM plugin_devicelocation_point p WHERE p.deviceId=d.id) AS newest_point
FROM devices d LEFT JOIN configurations c ON c.id=d.configurationId ORDER BY d.number;
"@
    docker compose exec -T db psql -U hmdm -d hmdm -c $sql

    Write-Host ""
    Note "'tracking' must be GPS or WIFI. DONOTTRACK means the launcher is never asked"
    Note "to collect a position - switch on 'Ask every device' in the plugin settings,"
    Note "or set Location Tracking on the configuration."

    docker compose exec -T db psql -U hmdm -d hmdm -c `
      "SELECT keepPoints, lostIntervalMins, trackAllDevices FROM plugin_devicelocation_settings;"
}

# --- 6. what the launcher itself says ---------------------------------------------
Head "6. Launcher log (15s) - force a sync now to see it"
Note "Watching logcat for HeadwindMDM location lines."
Note "Tap the screen / reopen the launcher on the emulator to trigger a sync."
& $adb logcat -c
$job = Start-Job -ScriptBlock { param($a) & $a logcat -s HeadwindMDM:V } -ArgumentList $adb
Start-Sleep -Seconds 15
Stop-Job $job | Out-Null
$log = Receive-Job $job
Remove-Job $job | Out-Null

$interesting = $log | Select-String "location|Location|gps|GPS"
if ($interesting) {
    $interesting | Select-Object -First 20 | ForEach-Object { Note $_.ToString().Trim() }
} else {
    Note "(nothing location-related in 15s - the launcher may simply not have synced yet)"
}

Head "Done"
Write-Host "The first FAIL above is the thing to fix. If everything passed but the map is"
Write-Host "still empty, the 'points' column in step 5 is the deciding fact: a non-zero count"
Write-Host "means the server has the data and the problem is in the page, not the device."
