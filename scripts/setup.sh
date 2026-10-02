#!/usr/bin/env bash
# Automatic setup script for macOS/Linux users who don't want to install Anaconda.
# Installs SDKMAN (if missing), then Java and Maven via SDKMAN.
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

echo
echo "Setup complete. Installed versions:"
java -version
mvn -version

echo
echo "You can now run the app with: ./mvnw spring-boot:run"
