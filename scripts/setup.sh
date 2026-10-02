#!/usr/bin/env bash
# Automatic setup script for macOS/Linux users who don't want to install Anaconda.
# Installs SDKMAN (if missing), then Java and Maven via SDKMAN.
# Installs nvm (if missing), then Node.js via nvm.
set -euo pipefail

JAVA_VERSION="21-tem"
MAVEN_VERSION="3.9.16"

if [ -z "${SDKMAN_DIR:-}" ] && [ ! -d "$HOME/.sdkman" ]; then
  echo "Installing SDKMAN..."
  curl -s "https://get.sdkman.io" | bash
fi

set +u
# shellcheck disable=SC1090
source "$HOME/.sdkman/bin/sdkman-init.sh"
set -u

echo "Installing Java ${JAVA_VERSION}..."
sdk install java "${JAVA_VERSION}" < /dev/null || true
sdk default java "${JAVA_VERSION}"

echo "Installing Maven ${MAVEN_VERSION}..."
sdk install maven "${MAVEN_VERSION}" < /dev/null || true
sdk default maven "${MAVEN_VERSION}"

if [ ! -d "$HOME/.nvm" ]; then
  echo "Installing nvm..."
  curl -s -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh" | bash
fi

set +u
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"
set -u

echo "Installing latest LTS Node.js..."
nvm install --lts
nvm use --lts

echo
echo "Setup complete. Installed versions:"
java -version
mvn -version
node -v
npm -v

echo
echo "You can now run the backend with: cd backend && ./mvnw spring-boot:run"
echo "You can now run the frontend with: cd frontend && npm install && npm start"
