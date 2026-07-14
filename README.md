# OctoRel

The motivation for this project is that GitHub's home feed only shows the new releases of your 100 most recently starred repositories, making you miss out on the others.

Users sign in with GitHub through a GitHub App, which OctoRel uses to read their starred repositories and the latest releases.

## Features

- One feed with the most recent release of every repository you starred, newest first
- Release notes rendered as markdown, with reactions and pre-release badges
- Search across your starred repositories and jump straight to a release
- Sign in with GitHub — the app only gets read access to your stars
- Light and dark theme

## Setup

OctoRel needs a GitHub App to sign users in. Create one under **Settings → Developer settings → GitHub Apps → New GitHub App** with:

- **Callback URL**: `<your-origin>/api/callback` — you can add several, e.g. `http://localhost:3000/api/callback` for development and your production URL.
- **Expire user authorization tokens**: disable it (OctoRel does not implement token refresh yet).
- **Webhook**: deactivate.
- **Permissions**: Account permissions → Starring → Read-only. Nothing else.

Then copy `.env.example` to `.env` and fill in the app's **Client ID** and a generated **client secret**:

```bash
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

The sign-in redirect is built from the origin the request arrives on (honoring `x-forwarded-host` / `x-forwarded-proto`), and that exact origin + `/api/callback` must be registered as a callback URL on the GitHub App. If your proxy doesn't send forwarding headers, or you want to pin a canonical origin, set `APP_URL` (e.g. `https://octorel.example.com`). The server logs the `redirect_uri` it uses on every sign-in attempt.

## Running locally

```bash
pnpm install
```

```bash
pnpm dev
```

## Development

Requires Node.js 20.9+ and pnpm 10.

- `pnpm check` — Biome (lint + format) and TypeScript
- `pnpm lint:fix` / `pnpm format:write` — apply lint fixes / formatting
- `pnpm check:write` — both of the above, then TypeScript
- `pnpm preview` — production build and serve

## Deployment

OctoRel is a stateless Next.js app: `pnpm build` and `pnpm start` on any Node host works. Provide the environment variables from `.env.example` at runtime, and make sure `https://<your-host>/api/callback` is registered as a callback URL on the GitHub App.
