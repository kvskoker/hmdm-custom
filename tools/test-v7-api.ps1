param([switch]$SeedLegacy)
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8087/rest/'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
function Call-Api($path, $method = 'GET', $body = $null) {
    $params = @{ Uri = $base + $path; Method = $method; WebSession = $session }
    if ($null -ne $body) { $params.ContentType = 'application/json'; $params.Body = ConvertTo-Json -InputObject $body -Depth 12 }
    $response = Invoke-RestMethod @params
    if ($response.status -ne 'OK') { throw "$method $path failed: $($response.message)" }
    return $response.data
}
function Assert-True($condition, $message) { if (!$condition) { throw $message }; Write-Output "PASS: $message" }
foreach ($endpoint in @('devicereset/private/history', 'deviceenroll/private/rules', 'devicelocation/private/map')) {
    $denied = $false
    try { $anonymous = Invoke-RestMethod ($base + 'plugins/' + $endpoint); $denied = $anonymous.status -ne 'OK' }
    catch { if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -in @(401,403)) { $denied = $true } else { throw } }
    Assert-True $denied "Anonymous access denied: $endpoint"
}
$null = Call-Api 'public/auth/login' 'POST' @{login='admin';password='21232F297A57A5A743894A0E4A801FC3'}
$number = 'V7-TEST001'
if ($SeedLegacy) {
    $existing = Call-Api "plugins/devicereset/private/status/$number"
    if (!$existing.found) { $null = Call-Api 'private/devices' 'PUT' @{number=$number;description='Isolated upgrade validation';configurationId=1;groups=@()} }
    $null = Call-Api 'plugins/deviceenroll/private/rules?groupName=V7%20Test&overwrite=true' 'POST' @{groupId=0;configurationId=1;prefix='TV7';digits=3;nextSeq=7;enabled=$true}
    $null = Call-Api 'plugins/devicereset/private/lock' 'POST' @{deviceNumber=$number;message='Upgrade test lock'}
    $null = Call-Api "plugins/devicelocation/private/lost/$number" 'POST' @{note='Upgrade test lost record'}
    docker compose -f (Join-Path $PSScriptRoot '../docker-compose.v7-test.yml') exec -T db psql -U hmdm -d hmdm -v ON_ERROR_STOP=1 -c "INSERT INTO plugin_devicelocation_point (deviceId,customerId,lat,lon,ts,whileLost) SELECT id,customerId,8.48,-13.23,1791480000000,true FROM devices WHERE number='V7-TEST001' ON CONFLICT (deviceId,ts) DO NOTHING;"
    if ($LASTEXITCODE -ne 0) { throw 'Could not create synthetic location fixture.' }
    Write-Output 'Legacy fixtures created in the isolated localhost:8087 stack.'
    exit
}
$status = Call-Api "plugins/devicereset/private/status/$number"
Assert-True ($status.found -and $status.locked) 'Legacy device and lock survived migration'
$rules = @(Call-Api 'plugins/deviceenroll/private/rules')
Assert-True (@($rules | Where-Object { $_.prefix -eq 'TV7' -and $_.nextSeq -eq 7 }).Count -eq 1) 'Enrollment rule and counter survived migration'
$lost = Call-Api "plugins/devicelocation/private/status/$number"
Assert-True ($lost.lost.note -eq 'Upgrade test lost record') 'Lost-device record survived migration'
Assert-True (@($lost.points | Where-Object { $_.ts -eq 1791480000000 -and $_.lat -eq 8.48 -and $_.lon -eq -13.23 -and $_.whileLost }).Count -eq 1) 'Location history survived migration'
$reset = Call-Api 'plugins/devicereset/private/reset' 'POST' @{deviceNumber=$number;pinLength=6}
$sync = Call-Api "public/sync/configuration/$number"
Assert-True ($sync.passwordReset -eq $reset.pin -and $sync.lock) 'PIN and lock reach the Android sync response'
Assert-True ($sync.requestUpdates -eq 'gps' -and $sync.disableLocation -eq $false) 'Lost-device tracking override reaches Android'
$history = @(Call-Api 'plugins/devicereset/private/history') | ConvertTo-Json -Depth 10
Assert-True (!$history.Contains($reset.pin) -and !$history.Contains('newPassword')) 'History does not expose the PIN'
$null = Call-Api "plugins/devicereset/public/password/$number" 'POST' @{}
$sync = Call-Api "public/sync/configuration/$number"
Assert-True (!$sync.passwordReset) 'PIN acknowledgement clears the pending instruction'
$null = Call-Api 'plugins/devicereset/private/unlock' 'POST' @{deviceNumber=$number}
$sync = Call-Api "public/sync/configuration/$number"
Assert-True ($sync.lock -eq $false) 'Explicit unlock reaches Android'
$null = Call-Api 'plugins/devicereset/private/reboot' 'POST' @{deviceNumber=$number}
$sync = Call-Api "public/sync/configuration/$number"
Assert-True ($sync.reboot -eq $true) 'Reboot is queued for the synthetic device'
$null = Call-Api "plugins/devicereset/public/reboot/$number" 'POST' @{}
$sync = Call-Api "public/sync/configuration/$number"
Assert-True (!$sync.reboot) 'Reboot acknowledgement clears the command'
$response = Invoke-RestMethod ($base+'plugins/devicereset/private/factoryreset') -WebSession $session -Method Post -ContentType 'application/json' -Body (@{deviceNumber=$number;confirmDeviceNumber='WRONG'} | ConvertTo-Json)
Assert-True ($response.status -ne 'OK') 'Wipe rejects a mismatching confirmation'
$null = Call-Api 'plugins/devicereset/private/factoryreset' 'POST' @{deviceNumber=$number;confirmDeviceNumber=$number}
$sync = Call-Api "public/sync/configuration/$number"
Assert-True ($sync.factoryReset -eq $true) 'Wipe is queued for the synthetic device'
$null = Call-Api "plugins/devicereset/public/$number" 'POST' @{factoryReset=$false}
$commands = @(Call-Api 'plugins/devicereset/private/commands')
Assert-True (@($commands | Where-Object { $_.deviceNumber -eq $number -and $_.deviceCapable -eq $false }).Count -gt 0) 'Wipe acknowledgement preserves the device capability result'
$null = Call-Api "plugins/devicelocation/private/found/$number" 'POST' @{}
$lost = Call-Api "plugins/devicelocation/private/status/$number"
Assert-True (!$lost.lost) 'Mark found clears the lost record'
# Restore fixture state so the checks can be repeated.
$null = Call-Api 'plugins/devicereset/private/lock' 'POST' @{deviceNumber=$number;message='Upgrade test lock'}
$null = Call-Api "plugins/devicelocation/private/lost/$number" 'POST' @{note='Upgrade test lost record'}
