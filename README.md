# OctoRel

The motivation for this project is that GitHub's home feed only shows the new releases of your 100 most recently starred repositories, making you miss out on the others.

Users sign in with GitHub through a GitHub App, which OctoRel uses to read their starred repositories and the latest releases.

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

## Running locally

```bash
pnpm install
```

```bash
pnpm dev
```
