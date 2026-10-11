<#
.SYNOPSIS
Build, verify, and sign a launcher APK without putting passwords in command arguments.
.EXAMPLE
.\tools\build-launcher.ps1 -KeystorePath "$HOME\hmdm-signing\hmdm-release.jks" -VersionCode 15391 -VersionName "6.39-custom.1"
.NOTES
Requires JDK 17 or a compatible JDK, Android SDK Platform 34, Build-Tools 35.0.0,
and an existing signing key. It does not create keys, upload APKs, or enroll devices.
Choose a version code greater than the one already installed on your device.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$KeystorePath,
    [Parameter(Mandatory = $true)][ValidateRange(1, 2100000000)][int]$VersionCode,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9._-]+$')][string]$VersionName,
    [string]$KeyAlias = 'hmdm',
    [string]$ServerUrl,
    [string]$SecondaryUrl,
    [ValidateRange(1, 65535)][int]$MqttPort = 31000,
    [string]$SdkPath,
    [string]$JavaHome,
    [string]$BuildToolsVersion = '35.0.0'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$android = Join-Path (Split-Path -Parent $PSScriptRoot) 'hmdm-android'
function Assert-Exit([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "$Step failed (exit $LASTEXITCODE). Do not upload an older APK." }
}
function Get-Endpoint([string]$Value) {
    $uri = $null
    if (-not [Uri]::TryCreate($Value, [UriKind]::Absolute, [ref]$uri) -or
        $uri.Scheme -notin @('https', 'http') -or $uri.UserInfo -or $uri.Query -or $uri.Fragment) {
        throw 'Server URLs must be absolute HTTP(S) addresses without credentials, query strings or fragments.'
    }
    return $uri
}
function Get-Constant([string]$Source, [string]$Name) {
    $pattern = '\b' + [regex]::Escape($Name) + '\s*=\s*("(?:\\.|[^"\\])*");'
    $match = [regex]::Match($Source, $pattern)
    if (-not $match.Success) { throw "Cannot verify generated $Name." }
    return ($match.Groups[1].Value | ConvertFrom-Json)
}

if (-not $ServerUrl) {
    $envFile = Join-Path (Split-Path -Parent $PSScriptRoot) '.env'
    if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) { throw 'Missing repository .env file. Set HMDM_DOMAIN and DEPLOY_MODE before building.' }
    $settings = @{}
    $skipDerived = $false
    foreach ($line in Get-Content -LiteralPath $envFile) {
        if ($line -match '^# ---- derived by deploy\.') { $skipDerived = $true; continue }
        if ($line -eq '# ---- end derived block ----') { $skipDerived = $false; continue }
        if (-not $skipDerived -and $line -match '^\s*(HMDM_DOMAIN|DEPLOY_MODE|HMDM_HTTP_PORT)\s*=\s*(.*)$') {
            $key = $Matches[1]
            $value = $Matches[2].Trim()
            if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
                $value = $value.Substring(1, $value.Length - 2)
            } else { $value = $value -replace '\s+#.*$', '' }
            $settings[$key] = $value
        }
    }
    $domain = $settings['HMDM_DOMAIN']
    if (-not $domain -or $domain -notmatch '^[A-Za-z0-9][A-Za-z0-9.-]*$') { throw 'Set HMDM_DOMAIN in .env to a hostname or IPv4 address (no scheme, port or path).' }
    $mode = $settings['DEPLOY_MODE']
    if (-not $mode) { $mode = 'dev' }
    switch ($mode) {
        'prod' { $ServerUrl = "https://$domain" }
        'dev' {
            $port = $settings['HMDM_HTTP_PORT']
            if (-not $port) { $port = '8080' }
            if ($port -notmatch '^[0-9]{1,5}$' -or [int]$port -lt 1 -or [int]$port -gt 65535) { throw 'Invalid HMDM_HTTP_PORT in .env.' }
            $ServerUrl = "http://${domain}:$port"
        }
        default { throw 'DEPLOY_MODE must be dev or prod.' }
    }
}
if (-not (Test-Path -LiteralPath $KeystorePath -PathType Leaf)) { throw 'Keystore file not found. Supply the existing release keystore, not a directory.' }
$keystore = (Resolve-Path -LiteralPath $KeystorePath).Path
if (-not $SecondaryUrl) { $SecondaryUrl = $ServerUrl }
$primary = Get-Endpoint $ServerUrl
$secondary = Get-Endpoint $SecondaryUrl
$serverProject = $primary.AbsolutePath.TrimEnd('/')
if ($secondary.AbsolutePath.TrimEnd('/') -cne $serverProject) { throw 'Primary and secondary URLs must have the same application path.' }
if (-not $SdkPath) { $SdkPath = $env:ANDROID_HOME }
if (-not $SdkPath) { $SdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$SdkPath = (Resolve-Path -LiteralPath $SdkPath).Path
$tools = Join-Path $SdkPath "build-tools\$BuildToolsVersion"
foreach ($file in @('zipalign.exe', 'apksigner.bat', 'aapt.exe')) {
    if (-not (Test-Path -LiteralPath (Join-Path $tools $file) -PathType Leaf)) { throw "Missing $file in $tools. Install Android SDK Build-Tools $BuildToolsVersion." }
}

$properties = @{
    hmdmBaseUrl = $primary.GetLeftPart([UriPartial]::Authority)
    hmdmSecondaryUrl = $secondary.GetLeftPart([UriPartial]::Authority)
    hmdmServerProject = $serverProject
    hmdmMqttPort = [string]$MqttPort
    hmdmVersionCode = [string]$VersionCode
    hmdmVersionName = $VersionName
}
$names = @('JAVA_HOME', 'PATH', 'ANDROID_HOME', 'ORG_GRADLE_PROJECT_hmdmRequestSignature')
$names += @($properties.Keys | ForEach-Object { "ORG_GRADLE_PROJECT_$_" })
$saved = @{}
foreach ($name in $names) { $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
$secure = $null
$secret = $null
$source = $null
$locationPushed = $false
try {
    if ($JavaHome) { $env:JAVA_HOME = (Resolve-Path -LiteralPath $JavaHome).Path }
    if ($env:JAVA_HOME) { $env:PATH = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:PATH }
    $null = Get-Command java -ErrorAction Stop
    $env:ANDROID_HOME = $SdkPath
    foreach ($name in $properties.Keys) {
        [Environment]::SetEnvironmentVariable("ORG_GRADLE_PROJECT_$name", $properties[$name], 'Process')
    }
    Write-Host "Server: $ServerUrl; secondary: $SecondaryUrl; MQTT port: $MqttPort"
    Write-Host "Version: $VersionName ($VersionCode). Use the same shared secret as the server."
    $secure = Read-Host 'Shared secret (hidden)' -AsSecureString
    $secret = [System.Net.NetworkCredential]::new('', $secure).Password
    if (-not $secret -or $secret -match '[\x00-\x1f\x7f]') { throw 'The shared secret must be nonempty and contain no control characters or line breaks.' }
    $env:ORG_GRADLE_PROJECT_hmdmRequestSignature = $secret

    Push-Location $android
    $locationPushed = $true
    # Generate and verify before assembling, so local property overrides fail early.
    & .\gradlew.bat --no-daemon clean :app:generateOpensourceReleaseBuildConfig
    Assert-Exit 'Build configuration generation'
    $source = Get-Content 'app/build/generated/source/buildConfig/opensource/release/com/hmdm/launcher/BuildConfig.java' -Raw
    foreach ($pair in @(@('BASE_URL', $properties.hmdmBaseUrl), @('SECONDARY_BASE_URL', $properties.hmdmSecondaryUrl), @('SERVER_PROJECT', $serverProject), @('VERSION_NAME', $VersionName), @('REQUEST_SIGNATURE', $secret), @('APPLICATION_ID', 'com.hmdm.launcher'))) {
        if ((Get-Constant $source $pair[0]) -cne $pair[1]) { throw "Generated $($pair[0]) differs from the requested value. Check overriding Gradle properties. No APK will be signed." }
    }
    if ($source -notmatch "\bVERSION_CODE\s*=\s*$VersionCode;" -or $source -notmatch "\bMQTT_PORT\s*=\s*$MqttPort;") { throw 'Generated version code or MQTT port does not match.' }
    Write-Host 'PASS: compiled endpoints, version and shared secret match.'
    & .\gradlew.bat --no-daemon :app:assembleOpensourceRelease
    Assert-Exit 'APK build'

    $release = Join-Path $android 'app\build\outputs\apk\opensource\release'
    $unsigned = Join-Path $release 'app-opensource-release-unsigned.apk'
    if (-not (Test-Path -LiteralPath $unsigned)) { throw 'Unsigned release APK missing. Remove external/injected signing overrides and use this script to sign.' }
    $aligned = Join-Path $release 'launcher-aligned.apk'
    $signed = Join-Path $release "hmdm-launcher-$VersionCode.apk"
    & "$tools\zipalign.exe" -f -v 4 $unsigned $aligned
    Assert-Exit 'APK alignment'
    Write-Host 'Enter the keystore/key passwords when apksigner prompts. These are not the shared secret.'
    & "$tools\apksigner.bat" sign --ks $keystore --ks-key-alias $KeyAlias --out $signed $aligned
    Assert-Exit 'APK signing'
    & "$tools\apksigner.bat" verify --verbose --print-certs $signed
    Assert-Exit 'Signature verification'
    $badging = & "$tools\aapt.exe" dump badging $signed
    Assert-Exit 'APK metadata verification'
    $package = @($badging | Where-Object { $_ -match '^package:' })
    if ($package.Count -ne 1 -or $package[0] -notmatch "name='com.hmdm.launcher'" -or $package[0] -notmatch "versionCode='$VersionCode'" -or $package[0] -notmatch ("versionName='" + [regex]::Escape($VersionName) + "'")) { throw 'Final APK identity/version verification failed.' }
    Write-Host $package[0]
    Write-Host "UPLOAD THIS APK: $signed"
    Write-Host "SHA256: $((Get-FileHash -LiteralPath $signed -Algorithm SHA256).Hash)"
} finally {
    if ($locationPushed) { Pop-Location }
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') }
    if ($null -ne $secure) { $secure.Dispose() }
    $secret = $null
    $source = $null
}
