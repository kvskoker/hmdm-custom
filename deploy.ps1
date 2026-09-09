<#
  One command for both modes. Everything comes from .env.

      .\deploy.ps1 up        start (build if needed)
      .\deploy.ps1 rebuild   rebuild the server image, then start
      .\deploy.ps1 down      stop, keeping data
      .\deploy.ps1 logs      follow the server log
      .\deploy.ps1 reset     stop AND DELETE the database and uploaded files

  DEPLOY_MODE in .env decides http-on-localhost versus https-on-your-domain.
  Compose cannot derive one variable from another, so this script does that one
  step and then hands over to plain "docker compose".
#>
param([string]$Command = "up")

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from the template - edit it, then run this again." -ForegroundColor Yellow
    exit 1
}

# Load .env into the process environment so docker compose sees it.
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $v = $Matches[2].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($Matches[1], $v, 'Process')
    }
}

$mode   = if ($env:DEPLOY_MODE) { $env:DEPLOY_MODE } else { 'dev' }
$domain = $env:HMDM_DOMAIN
if (-not $domain) { throw "set HMDM_DOMAIN in .env" }

switch ($mode) {
    'prod' {
        if (-not $env:LETSENCRYPT_EMAIL) { throw "set LETSENCRYPT_EMAIL in .env - Let's Encrypt requires it" }
        $env:COMPOSE_PROFILES = 'prod'
        $env:HMDM_PROTOCOL    = 'https'
        $env:HMDM_BASE_HOST   = $domain
        $env:PANEL_PUBLISH    = '127.0.0.1:8080'
        $env:DB_PUBLISH       = '127.0.0.1:5433'
        if (-not $env:PROXY_ADDRESSES) { $env:PROXY_ADDRESSES = '172.16.0.0/12' }
        if (-not $env:PROXY_IP_HEADER) { $env:PROXY_IP_HEADER = 'X-Real-IP' }
    }
    'dev' {
        $env:COMPOSE_PROFILES = ''
        $env:HMDM_PROTOCOL    = 'http'
        $env:HMDM_BASE_HOST   = "${domain}:8080"
        $env:PANEL_PUBLISH    = '8080'
        $env:DB_PUBLISH       = '5433'
        $env:PROXY_ADDRESSES  = ''
    }
    default { throw "DEPLOY_MODE must be 'dev' or 'prod', not '$mode'" }
}

function Show-Banner {
    $panel = if ($mode -eq 'dev') { "$($env:HMDM_PROTOCOL)://${domain}:8080" } else { "$($env:HMDM_PROTOCOL)://$domain" }
    Write-Host ""
    Write-Host "  mode     $mode"
    Write-Host "  panel    $panel"
    Write-Host "  devices  advertised as $($env:HMDM_PROTOCOL)://$($env:HMDM_BASE_HOST), MQTT on ${domain}:31000"
    Write-Host ""
}

switch ($Command) {
    'up'      { Show-Banner; docker compose up -d }
    'rebuild' { Show-Banner; docker compose build hmdm; docker compose up -d }
    'down'    { docker compose down }
    'logs'    { docker compose logs -f hmdm }
    'reset'   {
        $a = Read-Host "This deletes the database and every uploaded APK. Type 'yes'"
        if ($a -eq 'yes') { docker compose down -v } else { Write-Host "Cancelled." }
    }
    default   { Write-Host "Usage: .\deploy.ps1 {up|rebuild|down|logs|reset}"; exit 1 }
}
