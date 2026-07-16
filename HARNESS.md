# AI Project Harness

The `/harness` workspace runs bounded inspection, test, and build commands for public GitHub repositories inside an ephemeral Vercel Sandbox.

## Architecture

- GitHub is the source of project code.
- Vercel Sandbox performs isolated execution.
- Vercel AI Gateway summarizes captured output when model access is available.
- The browser stores the latest 20 run results locally.
- No database or Supabase schema is required by the harness.

## Required Vercel configuration

Create a random secret of at least 24 characters:

```bash
openssl rand -base64 32
```

Add it to the Vercel project as `HARNESS_ACCESS_KEY` for Preview and Production, then redeploy. The user enters this key in `/harness`; it is retained only in the current tab's `sessionStorage` and sent in the `X-Harness-Key` request header.

Vercel deployments use short-lived OIDC credentials for Sandbox and AI Gateway. Local development can instead configure `VERCEL_ACCESS_TOKEN` and optionally `AI_GATEWAY_API_KEY`.

## Safety boundaries

- Public `https://github.com/owner/repository` sources only.
- Git refs are validated before use.
- Users and models cannot submit shell commands.
- The selected mode maps to a fixed allowlisted command.
- Sandbox sessions are non-persistent and stopped after each run.
- Requests require JSON, same-origin validation, and the private access key.
- Captured output and AI summaries are truncated.

## Validation

```bash
npm run check
```

For a deployment smoke test:

1. Open `/harness` and enter the configured access key.
2. Run `inspect` against `https://github.com/yishaik/free-stack-starter` on `main`.
3. Confirm that an incorrect key returns `401` and does not create a Sandbox.
