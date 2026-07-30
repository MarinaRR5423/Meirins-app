param([switch]$submit)

$ErrorActionPreference = "Stop"
$BUNDLE_OUT = "$env:TEMP\blumm-check.bundle.js"
$ASSETS_OUT = "$env:TEMP\blumm-check-assets"

function Write-Step { param($n, $total, $msg) Write-Host "" ; Write-Host "[$n/$total] $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "  ERR $msg" -ForegroundColor Red }
function Write-Warn { param($msg) Write-Host "  WARN $msg" -ForegroundColor Yellow }

$totalSteps = if ($submit) { 4 } else { 3 }

# PASO 1: Check estatico
Write-Step 1 $totalSteps "Check estatico (sintaxis + patrones no-brand)"

node scripts/precheck.mjs
$checkExit = $LASTEXITCODE

if ($checkExit -ne 0) {
    Write-Host ""
    Write-Host "BUILD CANCELADO -- corrige los errores primero" -ForegroundColor Red
    exit 1
}

Write-Ok "Sin errores de sintaxis"

# PASO 2: Metro bundle local
Write-Step 2 $totalSteps "Metro bundle local (mismo bundler que EAS)"
Write-Host "  Bundling iOS... (1-2 min)" -ForegroundColor Gray

if (Test-Path $BUNDLE_OUT) { Remove-Item $BUNDLE_OUT -Force }
if (Test-Path $ASSETS_OUT) { Remove-Item $ASSETS_OUT -Recurse -Force }
New-Item -ItemType Directory -Force $ASSETS_OUT | Out-Null

$EXPORT_DIR = "$env:TEMP\blumm-export-check"
$STDERR_LOG = "$env:TEMP\blumm-metro-err.txt"

if (Test-Path $EXPORT_DIR) { Remove-Item $EXPORT_DIR -Recurse -Force }

cmd /c "npx expo export --platform ios --output-dir `"$EXPORT_DIR`" 2>`"$STDERR_LOG`""
$metroExit = $LASTEXITCODE

if ($metroExit -ne 0) {
    Write-Fail "Metro bundle fallo (exit $($metroExit)):"
    if (Test-Path $STDERR_LOG) {
        Get-Content $STDERR_LOG | Select-Object -First 40 |
            ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
    if (Test-Path $EXPORT_DIR) { Remove-Item $EXPORT_DIR -Recurse -Force }
    if (Test-Path $STDERR_LOG) { Remove-Item $STDERR_LOG -Force }
    Write-Host ""
    Write-Host "BUILD CANCELADO -- el bundle local fallo" -ForegroundColor Red
    exit 1
}

if (Test-Path $STDERR_LOG) { Remove-Item $STDERR_LOG -Force }
if (Test-Path $EXPORT_DIR) { Remove-Item $EXPORT_DIR -Recurse -Force }
Write-Ok "Bundle OK"

# PASO 3: EAS Build
Write-Step 3 $totalSteps "EAS Build (iOS production)"
Write-Host "  Todo OK localmente. Lanzando EAS..." -ForegroundColor Green
Write-Host ""

eas build --platform ios --profile production --non-interactive
if ($LASTEXITCODE -ne 0) {
    Write-Fail "EAS build fallo"
    exit 1
}

# PASO 4 (opcional): Submit a TestFlight
if ($submit) {
    Write-Step 4 $totalSteps "Submit a TestFlight"
    eas submit --platform ios --latest --non-interactive
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Submit fallo"
        exit 1
    }
    Write-Ok "Subido a TestFlight"
}

Write-Host ""
Write-Host "Pipeline completado con exito" -ForegroundColor Green
Write-Host ""
