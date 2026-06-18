# BugIt

A bug logging system for developers. Capture bugs from the terminal, review them in the browser. Multi-user, auth via magic link.

## Stack

- **API** - NestJS 10, MongoDB/Mongoose, port 3001
- **CLI** - Node.js ESM, published as `bugit-cli`, binary `bug`
- **Web** - Next.js 14 App Router, Tailwind CSS, port 3000
- **Auth** - NextAuth.js magic link (email) + CLI device flow
- **Email** - Brevo API
- **Logging** - Pino (structured JSON) + Axiom transport
- **Error tracking** - Sentry via `@sentry/nestjs`
- **Error codes** - Typed error codes with unique per-error IDs for traceability

---

## Local Development

### Requirements

- Node.js 20+
- MongoDB (`brew install mongodb-community && brew services start mongodb/brew/mongodb-community`)

### Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Copy and fill in web env
cp web/.env.local.example web/.env.local
# Generate NEXTAUTH_SECRET:
openssl rand -base64 32

# 3. Start API + web
npm run dev

# 4. (Optional) Seed sample data
cd api && npm run seed
```

### Environment variables

**`api/.env`**

```
MONGODB_URI=mongodb://localhost:27017/bugit
PORT=3001

# Axiom (optional — structured logging)
# AXIOM_TOKEN=axo_...
# AXIOM_DATASET=bugit

# Sentry (optional — error tracking)
# SENTRY_DSN=https://key@o.ingest.sentry.io/project
# SENTRY_TRACES_SAMPLE_RATE=0.1
```

**`web/.env.local`**

```
MONGODB_URI=mongodb://localhost:27017/bugit
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_API_URL=http://localhost:3001

# Brevo - without this, magic links are printed to the API terminal
BREVO_API_KEY=xkeysib-...
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=BugIt
```

> **Dev tip:** if `BREVO_API_KEY` is not set, magic links are logged to the API terminal so you can sign in without an email provider.

---

## CLI

### Install

```bash
cd cli && npm link        # local dev
# or, once published:
npm install -g bugit-cli
```

### Authentication

```bash
bug login     # opens browser, authenticate via magic link, token stored locally
bug logout    # clear stored token
bug whoami    # show auth status
```

### Log a bug

```bash
bug log "BullMQ job silently drops on 429" -p heirmpire -s high -t nestjs,bullmq
bug log "Prisma decimal returns string" -p billkit -s medium --desc "findOneAndUpdate with inc"
bug log "Login crashes on Safari" -p myapp -s critical -e prod
```

Options:

| Flag            | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| `-p, --project` | Project name                                                  |
| `-s, --sev`     | `low` \| `medium` \| `high` \| `critical` (default: `medium`) |
| `-e, --env`     | Environment: `local` \| `staging` \| `prod`                   |
| `-d, --desc`    | Description / steps to reproduce                              |
| `-n, --notes`   | Root cause or fix notes                                       |
| `-t, --tags`    | Comma-separated tags                                          |

### List bugs

```bash
bug list                       # all bugs, last 20
bug list --status open
bug list -p heirmpire --sev high
bug list --limit 50
```

### View a bug

```bash
bug view <id>                  # accepts full ID or 6-char short ID
```

### Update a bug

```bash
bug update <id> --status in-progress
bug update <id> --sev critical --notes "narrowed to body-parser issue"
bug update <id> --tags nestjs,redis,queue
```

### Resolve / Won't Fix shortcuts

```bash
bug resolve <id>
bug wontfix <id>
```

### Pipe from stdin

```bash
cat error.log | bug pipe "Build exploded" -p billkit -s high
npm run build 2>&1 | bug pipe "Build failed" -p heirmpire
```

---

## Web Dashboard

Open [http://localhost:3000](http://localhost:3000) after `npm run dev`.

- Stats bar: total, open, in-progress, resolved counts
- Filter by project, severity, status, or full-text search
- Inline status and severity updates on the bug detail page
- Notes textarea - saves on blur
- Comments section
- Dark / light theme toggle

---

## API: Error Handling

Every error thrown by the API returns a consistent JSON shape:

```json
{
  "errorId": "84597550-b9be-4166-a602-d2972668654b",
  "code": "BUG_NOT_FOUND",
  "message": "Bug abc123 not found",
  "statusCode": 404
}
```

| Field | Description |
|---|---|
| `errorId` | Unique UUID v4 generated per error instance. Cross-references the Axiom log entry and the Sentry event (`extra.errorId`). |
| `code` | Typed error code for programmatic handling. |
| `message` | Human-readable description. |
| `statusCode` | HTTP status code. |

### Error codes

| Code | HTTP Status | When |
|---|---|---|
| `AUTH_TOKEN_MISSING` | 401 | No `Authorization` header |
| `AUTH_TOKEN_INVALID` | 401 | Bearer token doesn't match a stored hash |
| `AUTH_SESSION_NOT_FOUND` | 404 | CLI session code invalid or expired |
| `AUTH_SESSION_EXPIRED` | 410 | CLI session already consumed |
| `AUTH_USER_NOT_FOUND` | 404 | NextAuth user missing |
| `BUG_NOT_FOUND` | 404 | Bug ID doesn't exist or was deleted |
| `BUG_INVALID_ID` | 400 | Bug ID is not a valid ObjectId |
| `COMMENT_BUG_NOT_FOUND` | 404 | Bug referenced by a comment doesn't exist |
| `VALIDATION_FAILED` | 400 | Request body failed class-validator checks |
| `INTERNAL_ERROR` | 500 | Unhandled exception |

### Sentry test endpoint

```bash
curl http://localhost:3001/debug-sentry
```

This throws an error to verify Sentry is capturing events. Check the Sentry dashboard for a new issue. The event will include `errorId` (under **Extra**) and `errorCode` (under **Tags**) for cross-referencing with Axiom logs.

---

## Deployment

### MongoDB - Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/bugit`
3. Use this as `MONGODB_URI` in both the API host and Vercel

### API - Railway

1. Push the repo to GitHub
2. New project on [railway.app](https://railway.app) → Deploy from GitHub → select the `api/` service
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   PORT=3001
   ```
4. Note the deployed URL (e.g. `https://bugit-api.railway.app`)

### Web - Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `web`
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<same value as local>
   NEXT_PUBLIC_API_URL=https://bugit-api.railway.app
   BREVO_API_KEY=xkeysib-...
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=BugIt
   ```

### API - update CORS

After deploying, update `api/src/main.ts` with your Vercel domain:

```ts
app.enableCors({
  origin: ["https://your-app.vercel.app", "http://localhost:3000"],
});
```

### CLI - update API URL

Before publishing to npm, set the production URL in `cli/src/config.js`:

```js
export const API_URL = process.env.BUGIT_API_URL ?? "https://bugit-api.railway.app";
```

Then publish:

```bash
cd cli
npm publish --access public
```

Users install with:

```bash
npm install -g bugit-cli
bug login
```
