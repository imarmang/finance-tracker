# Automatic setup script for Windows users who don't want to install Anaconda.
# Installs Java (Eclipse Temurin 21), Maven, and Node.js (LTS) via winget.

$ErrorActionPreference = "Stop"

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command "winget")) {
    Write-Host "winget was not found. Please install App Installer from the Microsoft Store, then re-run this script."
    exit 1
}

Write-Host "Installing Java 21 (Eclipse Temurin)..."
winget install -e --id EclipseAdoptium.Temurin.21.JDK --accept-package-agreements --accept-source-agreements

Write-Host "Installing Maven..."
winget install -e --id Apache.Maven --accept-package-agreements --accept-source-agreements

Write-Host "Installing Node.js (LTS)..."
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "Setup complete. Restart your terminal, then verify with:"
Write-Host "  java -version"
Write-Host "  mvn -version"
Write-Host "  node -v"
Write-Host "  npm -v"
Write-Host ""
Write-Host "You can then run the backend with: cd backend; .\mvnw.cmd spring-boot:run"
Write-Host "You can then run the frontend with: cd frontend; npm install; npm start"
