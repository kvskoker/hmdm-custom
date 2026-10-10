# Resolves Compose configuration only; never starts containers or edits the real .env.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$temp = Join-Path ([IO.Path]::GetTempPath()) ('hmdm-ports-' + [guid]::NewGuid())
$null = New-Item -ItemType Directory $temp
$bash = (Get-Command bash -ErrorAction SilentlyContinue).Source
if (Test-Path 'C:\Program Files\Git\bin\bash.exe') { $bash = 'C:\Program Files\Git\bin\bash.exe' }
if (-not $bash) { throw 'Bash is required to test deploy.sh' }
$pwsh = (Get-Process -Id $PID).Path
$names = @('DEPLOY_MODE', 'HMDM_DOMAIN', 'LETSENCRYPT_EMAIL', 'SQL_PASS', 'COMPOSE_PROFILES', 'HMDM_PROTOCOL', 'HMDM_BASE_HOST', 'PANEL_PUBLISH', 'DB_PUBLISH', 'PROXY_ADDRESSES', 'PROXY_IP_HEADER', 'HMDM_HTTP_PORT', 'DB_HOST_PORT', 'MQTT_HOST_PORT', 'CADDY_HTTP_PORT', 'CADDY_HTTPS_PORT')
$saved = @{}
$names += 'HMDM_PROXY'
$names += 'HMDM_SHARED_SECRET'
foreach ($name in $names) {
    $saved[$name] = [Environment]::GetEnvironmentVariable($name)
    [Environment]::SetEnvironmentVariable($name, $null)
}
function Assert($condition, $message) { if (-not $condition) { throw $message } }
try {
    foreach ($file in @('deploy.sh', 'deploy.ps1', 'docker-compose.yml')) {
        $content = [IO.File]::ReadAllText((Join-Path $root $file)).Replace("`r`n", "`n")
        [IO.File]::WriteAllText((Join-Path $temp $file), $content)
    }
    foreach ($shell in @('powershell', 'bash')) {
        foreach ($scenario in @('dev', 'prod', 'external')) {
            $mode = if ($scenario -eq 'external') { 'prod' } else { $scenario }
            foreach ($custom in @($false, $true)) {
                $envText = "DEPLOY_MODE=$mode`nHMDM_DOMAIN=mdm.example.com`nLETSENCRYPT_EMAIL=test@example.com`nSQL_PASS=test-only`n"
                $fixtureSecret = ' fixture!$#&"<> \value '
                $envText += "HMDM_SHARED_SECRET='$fixtureSecret'`n"
                if ($scenario -eq 'external') {
                    $envText = $envText.Replace('LETSENCRYPT_EMAIL=test@example.com', 'LETSENCRYPT_EMAIL=')
                    $envText += "HMDM_PROXY=external`n"
                }
                if ($custom) {
                    $envText += "HMDM_HTTP_PORT=8088`nDB_HOST_PORT=5434`nMQTT_HOST_PORT=31001`nCADDY_HTTP_PORT=8081`nCADDY_HTTPS_PORT=8443`n"
                }
                # Old generated values must not override the current inputs.
                $envText += "# ---- derived by deploy.sh from DEPLOY_MODE - do not edit ----`nHMDM_BASE_HOST=stale.example:1234`nPANEL_PUBLISH=1234`nDB_PUBLISH=1235`nPROXY_ADDRESSES=stale`n# ---- end derived block ----`n"
                [IO.File]::WriteAllText((Join-Path $temp '.env'), $envText)
                for ($run = 0; $run -lt 2; $run++) {
                    if ($shell -eq 'bash') {
                        $output = & $bash (Join-Path $temp 'deploy.sh') config --format json
                    } else {
                        $output = & $pwsh -NoProfile -File (Join-Path $temp 'deploy.ps1') config --format json
                    }
                    Assert ($LASTEXITCODE -eq 0) "$shell $mode failed"
                    $config = ($output -join "`n") | ConvertFrom-Json
                    # Compose escapes literal dollars when serializing reusable config.
                    Assert ($config.services.hmdm.environment.HMDM_SHARED_SECRET -ceq $fixtureSecret.Replace('$', '$$')) 'Shared secret changed during .env loading'
                    $port = if ($custom) { 8088 } else { 8080 }
                    $hostPort = $config.services.hmdm.ports | Where-Object target -eq 8080
                    Assert ($hostPort.published -eq "$port") 'Incorrect panel port'
                    $hostName = if ($mode -eq 'prod') { 'mdm.example.com' } else { "mdm.example.com:$port" }
                    Assert ($config.services.hmdm.environment.BASE_HOST -eq $hostName) 'Incorrect advertised address'
                    if ($mode -eq 'prod') { Assert ($hostPort.host_ip -eq '127.0.0.1') 'Production panel exposed publicly' }
                    $dbPort = if ($custom) { '5434' } else { '5433' }
                    Assert ($config.services.db.ports[0].published -eq $dbPort) 'Incorrect database port'
                    $mqttPort = if ($custom) { '31001' } else { '31000' }
                    Assert (($config.services.hmdm.ports | Where-Object target -eq 31000).published -eq $mqttPort) 'Incorrect MQTT port'
                    if ($scenario -eq 'prod') {
                        $httpsPort = if ($custom) { '8443' } else { '443' }
                        Assert (($config.services.caddy.ports | Where-Object target -eq 443).published -eq $httpsPort) 'Incorrect HTTPS port'
                    }
                    if ($scenario -eq 'external') {
                        Assert ($null -eq $config.services.caddy) 'External mode must exclude Caddy'
                        Assert ($config.services.hmdm.environment.PROTOCOL -eq 'https') 'External mode must advertise HTTPS'
                    }
                }
                Write-Host "PASS $shell $scenario custom=$custom (including second run)"
            }
        }
        foreach ($invalid in @('0', '65536', 'abc', '8080:8080')) {
            [IO.File]::WriteAllText((Join-Path $temp '.env'), "DEPLOY_MODE=dev`nHMDM_DOMAIN=mdm.example.com`nHMDM_HTTP_PORT=$invalid`n")
            if ($shell -eq 'bash') {
                $output = & $bash (Join-Path $temp 'deploy.sh') config --format json 2>&1
            } else {
                $output = & $pwsh -NoProfile -File (Join-Path $temp 'deploy.ps1') config --format json 2>&1
            }
            Assert ($LASTEXITCODE -ne 0) "$shell accepted invalid port $invalid"
            Assert (($output -join "`n") -match 'must be a port number') 'Unexpected validation failure'
        }
        Write-Host "PASS $shell invalid ports"
        [IO.File]::WriteAllText((Join-Path $temp '.env'), "DEPLOY_MODE=prod`nHMDM_DOMAIN=mdm.example.com`nHMDM_PROXY=invalid`n")
        if ($shell -eq 'bash') {
            $output = & $bash (Join-Path $temp 'deploy.sh') config --format json 2>&1
        } else {
            $output = & $pwsh -NoProfile -File (Join-Path $temp 'deploy.ps1') config --format json 2>&1
        }
        Assert ($LASTEXITCODE -ne 0) "$shell accepted invalid proxy"
        Assert (($output -join "`n") -match 'HMDM_PROXY must be') 'Unexpected proxy validation failure'
        Write-Host "PASS $shell invalid proxy"
    }
} finally {
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $saved[$name]) }
    # Delete only files created by this test, without recursive directory removal.
    foreach ($file in @('deploy.sh', 'deploy.ps1', 'docker-compose.yml', '.env', '.env.bak')) {
        $path = Join-Path $temp $file
        if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path }
    }
    [IO.Directory]::Delete($temp)
}
