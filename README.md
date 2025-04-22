# XBorg Tech Challenge

## Submission Requirements

- [Unit Tests](#-unit-testing)
- [Integration Tests](#-integration-testing)
- [E2E Testing](#-e2e-testing-playwright--metamask)
- [Testing Performance benchmarks](#-performance-testing)
- Clearly document strategies via effective testing and in the Submission Documentation section of the ReadMe

Implementation should be submitted via a public GitHub repository, or a private repository with collaborator access granted to the provided emails.

## Architecture

- Language - Typescript
- Monorepo - Turborepo
- Client - NextJs
- Api - NestJs
- DB - SQLite

## Apps and Packages

- `client`: [Next.js](https://nextjs.org/) app
- `api`: [Nestjs](https://nestjs.com) app
- `tsconfig`: Typescript configuration used throughout the monorepo

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/) for Git hooks

## Steps to run app

```bash
# Start the infrastructure
$ yarn start:local:infra

# Migrate the DB
$ cd apps/api && yarn migrate:local

# Install dependencies
$ yarn install

# Create and migrate the DB
 $ cd apps/api
 $ yarn migrate:local

 # Build the app including the lib
$ yarn build

 # Run the application stack in dev (enter command from the project root)
 $ yarn dev
```

## Additional Commands

```bash
# Run tests in all apps
$ yarn test

# Run linter in all apps
$ yarn lint

# Format code in all apps
$ yarn format

```

## Submission Documentation...

## 🧪 Unit Testing

This project is a full-stack TypeScript monorepo using **Turborepo**. It includes:

- `apps/api` – NestJS microservice backend (e.g. user creation, DB)
- `apps/gateway` – NestJS API gateway (authentication, SIWE handling)
- `apps/client` – Next.js frontend
- `packages/lib-server` – Shared DTOs and types
- SQLite database (for local development)

---

### Unit Testing Work

Unit tests are implemented with **Jest + ts-jest** and cover both the `gateway` and `api` applications.

---

### `apps/gateway` – Unit Tests

Focus: Controller logic related to login/signup via SIWE and JWT issuance.

#### Covered Module

**`apps/gateway/src/user/user.controller.ts`**

Tests include:

- `signup()` returns a JWT token on successful registration
- `login()` returns a JWT token on valid SIWE signature
- `login()` throws `UnauthorizedException` on invalid signature

#### Mocked Dependencies

- `SiweService` – mocked `.verifyMessage()`
- `UserClientAPI` – mocked `.signUp()` and `.getUser()`
- `JwtService` – mocked `.buildAuthRes()`

#### Test Files

- `apps/api/src/user/__tests__/user.service.spec.ts`
- `apps/api/src/user/__tests__/user.repository.spec.ts`

## 🔗 Integration Testing

Integration tests are implemented using `supertest` against a live `NestJS` app instance to verify that services, modules, and real infrastructure (e.g. database, SIWE auth flow) work together correctly.

### 📁 Structure

All integration tests are located in:

`apps/gateway/test/`

### ✅ Tested Scenarios

**`signup.e2e-spec.ts`**

- Dynamically generates a new Ethereum wallet
- Retrieves a valid nonce via `/v1/siwe/nonce/:address`
- Signs a valid [SIWE](https://siwe.io) message using `ethers`
- Sends the signed message and user details to `/v1/user/signup`
- Asserts that a valid JWT token is returned

**`login.e2e-spec.ts`**

- Uses a fixed test wallet (loaded from `.env.test.local`)
- Retrieves a fresh nonce from the backend
- Signs the login message
- Sends the signed message to `/v1/user/login`
- Verifies that the backend returns a valid JWT token

### ⚙️ Environment Configuration

Create a `.env.test.local` file in `apps/gateway/`:

```bash
TEST_DOMAIN=localhost
TEST_ORIGIN=http://localhost:3000
TEST_PRIVATE_KEY=0xabc123... # used only in login test
```

Run all integration tests:

```bash
yarn test:e2e
```

## 🧪 E2E Testing (Playwright + MetaMask)

E2E tests are implemented using [`playwright`](https://playwright.dev/) together with [`dappwright`](https://github.com/TenKeyLabs/dappwright), enabling full browser automation of MetaMask flows in a real Chromium instance.

### 📁 Structure

All E2E tests are located in:

```bash
apps/client/tests/ui/
```

### ✅ Tested Scenarios

**`login-metamask.spec.ts`**

- Launches MetaMask in Chromium using Dappwright
- Imports a known test wallet from `.env.local.test`
- Opens the dapp and clicks “Login with MetaMask”
- Approves the connection and signs the login message
- Verifies successful login by checking for the `Profile` page

**`signup-metamask.spec.ts`**

- Dynamically generates a new Ethereum wallet
- Launches MetaMask and imports the new wallet
- Opens the dapp and fills out the signup form
- Connects MetaMask and signs the signup message
- Verifies that the user is redirected to the profile page
- Asserts that profile details match input data

### ⚙️ Environment Configuration

Create a `.env.local.test` file in the project **root**:

```bash
METAMASK_SEED="job question hip human ... leisure"
METAMASK_PASSWORD="YourMetaMaskPassword123"
```

### 🚀 Running E2E Tests

Run tests using Playwright CLI:

```bash
npx playwright test
```

## 🚀 Performance Testing

Page load performance is tested using Playwright, with metrics like `DOMContentLoaded` time captured for key pages.

### 📁 Structure

Performance test is located at:

```bash
apps/client/tests/ui/home-performance.spec.ts
```

Results are written to:

```bash
apps/playwright-report/performance.json
 apps/playwright-report/index.html
```

### ✅ What It Measures

- `DOMContentLoaded` time for:
  - Home page (`/`)
  - Login page (`/login`)
  - Signup page (`/signup`)

Each entry includes:

- Page label
- Load time (ms)
- Timestamp

### 🖥️ Running Performance Test

After playwright tests are executed check

```bash
 apps/playwright-report/index.html
```
