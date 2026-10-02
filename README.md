# finance-tracker

A finance tracking application with a Java/Spring Boot backend and an Angular frontend.

## Tech Stack

**Backend** (`backend/`)

- **Java** 21
- **Spring Boot** 4.1.1 (`spring-boot-starter-webmvc`)
- **Maven** 3.9.16 (via Maven Wrapper)

**Frontend** (`frontend/`)

- **Angular** 22
- **Node.js** ^22.22.3 || ^24.15.0 || >=26.0.0
- **npm** 10

This app is a Spring Java Maven backend with an Angular frontend. For the latest deployment, go to the latest `release/*` branch.

## Prerequisites

You need Java 21 (JDK) and Node.js installed. Maven and the Angular CLI are bundled per-project (Maven Wrapper for the backend, local `node_modules` for the frontend), so you don't need to install them globally.

If you don't already have these installed, run the setup script for your OS from the `scripts/` folder:

**macOS / Linux:**

```bash
./scripts/setup.sh
```

This installs [SDKMAN](https://sdkman.io/) if it isn't already present and uses it to install Java 21 and Maven 3.9.16, then installs [nvm](https://github.com/nvm-sh/nvm) if it isn't already present and uses it to install the latest LTS release of Node.js.

**Windows (PowerShell):**

```powershell
.\scripts\setup.ps1
```

This uses [winget](https://learn.microsoft.com/windows/package-manager/winget/) to install Eclipse Temurin JDK 21, Maven, and the latest LTS release of Node.js.

## Getting Started

### Backend

Run the application using the Maven Wrapper:

```bash
cd backend
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

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run the dev server (serves at `http://localhost:4200`):

```bash
npm start
```

Run the test suite:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## License

This project is licensed under the [MIT License](LICENSE).
