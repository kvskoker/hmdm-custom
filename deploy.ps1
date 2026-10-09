<#
  One command for both modes. Everything comes from .env.

      .\deploy.ps1 up        start (build if needed)
      .\deploy.ps1 rebuild   rebuild the server image, then start
      .\deploy.ps1 down      stop, keeping data
      .\deploy.ps1 logs      follow the server log
      .\deploy.ps1 reset     stop AND DELETE the database and uploaded files

  Anything else is passed straight to "docker compose", so
  ".\deploy.ps1 ps" and ".\deploy.ps1 logs --tail=500 hmdm" work.

  DEPLOY_MODE in .env decides http-on-localhost versus https-on-your-domain.
  Compose cannot derive one variable from another, so this script does that one
  step. It writes the results back into .env in a managed block, which means
  plain "docker compose ..." works too - without that, every compose command run
  by hand fails with "required variable HMDM_BASE_HOST is missing a value".
#>
param(
    [string]$Command = "up",
    [Parameter(ValueFromRemainingArguments = $true)] [string[]]$Rest
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from the template - edit it, then run this again." -ForegroundColor Yellow
    exit 1
}

# Ignore the generated block, just as deploy.sh does.
$skipDerived = $false
Get-Content .env | ForEach-Object {
    if ($_ -match '^# ---- derived by deploy\.(sh|ps1) from DEPLOY_MODE') { $skipDerived = $true; return }
    if ($_ -eq '# ---- end derived block ----') { $skipDerived = $false; return }
    if ($skipDerived) { return }
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $v = $Matches[2].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($Matches[1], $v, 'Process')
    }
}

$mode   = if ($env:DEPLOY_MODE) { $env:DEPLOY_MODE } else { 'dev' }
$domain = $env:HMDM_DOMAIN
if (-not $domain) { throw "set HMDM_DOMAIN in .env" }

$portDefaults = @{
    HMDM_HTTP_PORT = 8080
    DB_HOST_PORT = 5433
    MQTT_HOST_PORT = 31000
    CADDY_HTTP_PORT = 80
    CADDY_HTTPS_PORT = 443
}
foreach ($name in $portDefaults.Keys) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if (-not $value) { $value = [string]$portDefaults[$name] }
    $port = 0
    if ($value -notmatch '^[0-9]{1,5}$' -or -not [int]::TryParse($value, [ref]$port) -or $port -lt 1 -or $port -gt 65535) {
        throw "$name must be a port number from 1 to 65535"
    }
    [Environment]::SetEnvironmentVariable($name, [string]$port, 'Process')
}

switch ($mode) {
    'prod' {
        if (-not $env:LETSENCRYPT_EMAIL) { throw "set LETSENCRYPT_EMAIL in .env - Let's Encrypt requires it" }
        $env:COMPOSE_PROFILES = 'prod'
        $env:HMDM_PROTOCOL    = 'https'
        $env:HMDM_BASE_HOST   = $domain
        $env:PANEL_PUBLISH    = "127.0.0.1:$($env:HMDM_HTTP_PORT)"
        $env:DB_PUBLISH       = "127.0.0.1:$($env:DB_HOST_PORT)"
        if (-not $env:PROXY_ADDRESSES) { $env:PROXY_ADDRESSES = '172.16.0.0/12' }
        if (-not $env:PROXY_IP_HEADER) { $env:PROXY_IP_HEADER = 'X-Real-IP' }
    }
    'dev' {
        $env:COMPOSE_PROFILES = ''
        $env:HMDM_PROTOCOL    = 'http'
        $env:HMDM_BASE_HOST   = "${domain}:$($env:HMDM_HTTP_PORT)"
        $env:PANEL_PUBLISH    = $env:HMDM_HTTP_PORT
        $env:DB_PUBLISH       = $env:DB_HOST_PORT
        $env:PROXY_ADDRESSES  = ''
        $env:PROXY_IP_HEADER  = ''
    }
    default { throw "DEPLOY_MODE must be 'dev' or 'prod', not '$mode'" }
}

# --- keep .env in step with DEPLOY_MODE --------------------------------------
# Compose reads .env by itself, so once these values are in there, every plain
# "docker compose" command works exactly as this script's do. The block is
# rewritten on every run; edit DEPLOY_MODE and HMDM_DOMAIN above it, not this.
$markBegin = '# ---- derived by deploy.ps1 from DEPLOY_MODE - do not edit ----'
$markEnd   = '# ---- end derived block ----'

$kept = @()
$skip = $false
foreach ($line in (Get-Content .env)) {
    if ($line -eq $markBegin -or $line -match '^# ---- derived by deploy\.(sh|ps1) from DEPLOY_MODE') { $skip = $true; continue }
    if ($line -eq $markEnd) { $skip = $false; continue }
    if (-not $skip) { $kept += $line }
}
while ($kept.Count -gt 0 -and $kept[-1].Trim() -eq '') { $kept = $kept[0..($kept.Count - 2)] }

$block = @(
    $markBegin,
    "COMPOSE_PROFILES=$($env:COMPOSE_PROFILES)",
    "HMDM_PROTOCOL=$($env:HMDM_PROTOCOL)",
    "HMDM_BASE_HOST=$($env:HMDM_BASE_HOST)",
    "PANEL_PUBLISH=$($env:PANEL_PUBLISH)",
    "DB_PUBLISH=$($env:DB_PUBLISH)",
    "PROXY_ADDRESSES=$($env:PROXY_ADDRESSES)",
    "PROXY_IP_HEADER=$($env:PROXY_IP_HEADER)",
    $markEnd
)
Copy-Item .env .env.bak -Force
Set-Content -Path .env -Value ($kept + '' + $block) -Encoding ascii

function Show-Banner {
    $panel = "$($env:HMDM_PROTOCOL)://$($env:HMDM_BASE_HOST)"
    Write-Host ""
    Write-Host "  mode     $mode"
    Write-Host "  panel    $panel"
    Write-Host "  devices  advertised as $($env:HMDM_PROTOCOL)://$($env:HMDM_BASE_HOST), MQTT host port $($env:MQTT_HOST_PORT)"
    Write-Host ""
}

switch ($Command) {
    'up'      { Show-Banner; docker compose up -d }
    'rebuild' { Show-Banner; docker compose build hmdm; docker compose up -d }
    'down'    { docker compose down }
    'logs'    { if ($Rest) { docker compose logs @Rest } else { docker compose logs -f hmdm } }
    'reset'   {
        $a = Read-Host "This deletes the database and every uploaded APK. Type 'yes'"
        if ($a -eq 'yes') { docker compose down -v } else { Write-Host "Cancelled." }
    }
    default   { docker compose @($Command) @Rest }
}
