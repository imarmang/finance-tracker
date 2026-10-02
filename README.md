# finance-tracker

A finance tracking application built with Java and Spring Boot.

## Tech Stack

- **Java** 21
- **Spring Boot** 4.1.1 (`spring-boot-starter-webmvc`)
- **Maven** 3.9.16 (via Maven Wrapper)

This app is a Spring Java Maven app. For the latest deployment, go to the latest `release/*` branch.

## Prerequisites

You need Java 21 (JDK) installed. Maven itself is bundled via the Maven Wrapper (`./mvnw`), so you don't need to install Maven separately.

If you don't already have Java installed, run the setup script for your OS from the `scripts/` folder:

**macOS / Linux:**

```bash
./scripts/setup.sh
```

This installs [SDKMAN](https://sdkman.io/) if it isn't already present, then uses it to install Java 21 and Maven 3.9.16.

**Windows (PowerShell):**

```powershell
.\scripts\setup.ps1
```

This uses [winget](https://learn.microsoft.com/windows/package-manager/winget/) to install Eclipse Temurin JDK 21 and Maven.

## Getting Started

Run the application using the Maven Wrapper:

```bash
./mvnw spring-boot:run
```

Run the test suite:

```bash
./mvnw test
```

Build a JAR:

```bash
./mvnw clean package
```

## License

This project is licensed under the [MIT License](LICENSE).
