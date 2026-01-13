# Dracin Stream V2 - Cloudflare Pages Deployment Script
# This script uses Docker to build and deploy the application to Cloudflare Pages

param(
    [Parameter(Mandatory=$false)]
    [string]$CLOUDFLARE_API_TOKEN
)

# Check if Docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop."
    exit 1
}

# Check if Docker is running
$dockerStatus = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker is not running. Please start Docker Desktop."
    exit 1
}

# Prompt for API token if not provided
if (-not $CLOUDFLARE_API_TOKEN) {
    $secureToken = Read-Host -Prompt "Enter your Cloudflare API Token" -AsSecureString
    $CLOUDFLARE_API_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    )
}

if (-not $CLOUDFLARE_API_TOKEN) {
    Write-Error "Cloudflare API Token is required."
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Dracin Stream V2 - Cloudflare Deploy" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get current directory
$projectPath = (Get-Location).Path

Write-Host "[1/4] Starting Docker container..." -ForegroundColor Yellow

# Run build and deploy in Docker container
docker run --rm `
    -v "${projectPath}:/app" `
    -w /app `
    -e CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN `
    node:20-slim `
    /bin/bash -c @"
echo '[2/4] Installing dependencies...'
npm install

echo '[3/4] Building application...'
npm run build

echo '[4/4] Deploying to Cloudflare Pages...'
npx wrangler pages deploy .svelte-kit/cloudflare --project-name dracinku --branch main
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nYour site is live at: https://dracinku.pages.dev" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "  Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
    exit 1
}
