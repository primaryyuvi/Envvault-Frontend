# EnvVault Frontend

EnvVault Frontend is the browser dashboard for EnvVault, a zero-knowledge secrets management platform. It provides the user interface for authentication, project and environment management, encrypted secret storage, team access control, and audit visibility.

This repository is published for transparency and review. It is intended to let readers understand how the frontend is structured and how EnvVault protects secrets in the browser. It is not open for public contributions.

## Contents

- [Overview](#overview)
- [Zero-Knowledge Design](#zero-knowledge-design)
- [Cryptography Model](#cryptography-model)
- [Application Flow](#application-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Inspection](#local-inspection)
- [Environment Configuration](#environment-configuration)
- [License](#license)

## Overview

EnvVault is designed so that secret values are encrypted and decrypted on the client side. The backend is responsible for authentication, authorization, metadata, encrypted payload storage, and audit records, but it does not receive plaintext secret values.

The frontend handles:

- User sign-in and session bootstrap
- Browser-side key generation during registration
- Project key creation and sharing
- Secret encryption before API submission
- Secret decryption after API retrieval
- Project, environment, team, and audit interfaces

## Zero-Knowledge Design

EnvVault follows a zero-knowledge approach for secrets: the application server stores encrypted secret payloads and related metadata, but plaintext secret values are only available inside an authenticated user's browser session.

In practice, this means:

- Secret values are encrypted in the browser before they are sent to the backend.
- Secret values are decrypted in the browser only after the user has an active authenticated session and the required project key.
- The backend stores encrypted values and initialization vectors, not raw secret values.
- Project access is controlled by encrypting the project key for authorized users.
- Removing access prevents future retrieval of usable project key material through the normal application flow.

No frontend application can hide network destinations or runtime configuration from a browser user. For that reason, backend API URLs are not treated as secrets and are not committed in this repository. Production deployments must inject the API base URL through private environment configuration.

## Cryptography Model

The frontend uses the browser Web Crypto APIs through `src/utils/crypto.ts` and stores session-only key material through `src/utils/secureSession.ts`.

### Account Registration

During registration:

1. The browser generates an RSA key pair.
2. The public key is exported and sent to the backend.
3. The private key is encrypted in the browser using a key derived from the user's email and password.
4. Only the encrypted private key is sent to the backend.

The backend can store the encrypted private key, but it does not receive the decrypted private key.

### Sign In

During sign-in:

1. The user authenticates with the backend.
2. The backend returns the encrypted private key and session tokens.
3. The browser derives the password-based key again.
4. The encrypted private key is decrypted locally in the browser.
5. The decrypted private key is kept in browser session state for the active session.

If the browser session is cleared, the decrypted private key is removed and the user must sign in again to restore access.

### Project Keys

Each project has its own symmetric project key. That key is used to encrypt and decrypt secrets for the project.

When a project is created:

1. The browser generates a new project key.
2. The project key is encrypted with the creator's public key.
3. The encrypted project key is sent to the backend.
4. The plaintext project key remains client-side.

When another user is granted access:

1. The frontend obtains that user's public key.
2. The project key is encrypted for that public key.
3. The backend stores the encrypted project key for that user.

The backend can route encrypted project keys, but it cannot decrypt them without the corresponding private key.

### Secret Encryption

When a secret is created or updated:

1. The browser loads the project key for the selected project.
2. The secret value is encrypted in the browser.
3. The encrypted payload and IV are sent to the backend.
4. The plaintext value is never submitted to the API.

When secrets are viewed:

1. The backend returns encrypted secret records.
2. The browser retrieves or decrypts the project key.
3. The browser decrypts each secret locally for display.

## Application Flow

The app starts in `src/main.tsx`, renders `App.tsx`, and mounts routes from `src/routes/routes.tsx`.

Public routes include:

- `/`
- `/signin`
- `/signup`

Protected routes render the main application shell:

- `/dashboard`
- `/projects`
- `/teams`
- `/settings`

API requests are centralized in `src/utils/ApiClient.ts`. The Axios client adds access tokens from browser storage, attempts token refresh on unauthorized responses, and clears local auth state when refresh fails.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- React Router
- Axios
- Lucide React
- Browser Web Crypto APIs

## Project Structure

```text
src/
  assets/          Static app assets
  components/      Reusable UI components and dialogs
  config/          Runtime configuration
  contexts/        React context providers
  pages/           Route-level pages and application views
  routes/          Route definitions and protected route handling
  services/        API-facing service modules
  types/           Shared TypeScript types
  utils/           API client, cryptography, session storage, and helpers
```

Key files:

- `src/config/config.ts` reads runtime configuration.
- `src/contexts/AuthContext.tsx` manages authentication and session bootstrap.
- `src/utils/ApiClient.ts` configures authenticated API communication.
- `src/utils/crypto.ts` contains browser cryptography helpers.
- `src/utils/secureSession.ts` manages local tokens, session keys, and cached project keys.
- `src/services/Keys.service.ts` encrypts and decrypts secret values around API calls.
- `src/services/Project.service.ts` manages project keys and access sharing.

## Local Inspection

This repository can be installed and run locally for review.

```bash
npm install
npm run dev
```

For a connected local run, provide a private API base URL in `.env.local`:

```env
VITE_API_BASE_URL=
```

The value is intentionally left blank in this repository. Set it privately in your own environment.

Available scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build the frontend. |
| `npm run lint` | Run ESLint. |
| `npm run preview` | Preview the production build locally. |

## Environment Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes for connected API usage | API base URL injected privately by local or deployment environment. The production value is not stored in this repository. |

Because this is a browser application, any configured API URL will be visible in the generated client bundle and browser network requests. Do not place credentials, signing secrets, database URLs, or private service keys in Vite environment variables.

## Contributions

Public contributions are not accepted for this repository. Issues, pull requests, and external patches are not part of the current project workflow.

## License

This project is licensed under the MIT License. See the repository license for details.
