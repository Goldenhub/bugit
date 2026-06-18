# bugit-cli

Log bugs from your terminal without breaking your flow.

```bash
npm install -g bugit-cli
```

Then authenticate:

```bash
bug login
```

---

## Quick start

```bash
bug login                          # authenticate via browser
bug log "Login crashes on Safari"  # log a bug
bug list                           # see your bugs
bug view <id>                      # inspect a bug
```

---

## Help

Every command has built-in help:

```bash
bug --help          # list all commands and global options
bug help <command>  # detailed help for a specific command
```

---

## Commands

### `bug login`

Authenticate via browser-based device flow. Opens a browser tab for you to approve the CLI session. Token is stored in `~/.buglogrc`.

```
USAGE
  bug login
```

```bash
bug login     # opens browser → approve in dashboard → CLI is authenticated
```

### `bug logout`

Remove stored credentials.

```
USAGE
  bug logout
```

```bash
bug logout  # clears token from ~/.buglogrc
```

### `bug whoami`

Show the authenticated email and API endpoint.

```
USAGE
  bug whoami
```

```bash
bug whoami
# you@email.com → https://bugit-j70c.onrender.com
```

### `bug log <title>`

Log a new bug.

```
USAGE
  bug log <title> [options]

ARGUMENTS
  title                 Bug title (required)

OPTIONS
  -s, --sev <level>     Severity: low | medium | high | critical   (default: medium)
  -p, --project <name>  Project name
  -e, --env <env>       Environment: local | staging | prod
  -d, --desc <text>     Description or steps to reproduce
  -n, --notes <text>    Root cause or fix notes
  -t, --tags <tags>     Comma-separated tags
```

```bash
bug log "Login crashes on Safari 17"
bug log "Checkout 500 on mobile" -s critical -p storefront -e prod
bug log "Slow query on reports page" -s medium -p api -t postgres,performance
bug log "Build failing" -s high --desc "error: cannot find module 'react'"
```

### `bug pipe <title>`

Pipe stdin into a bug description. Captures build errors, stack traces, and log output.

```
USAGE
  bug pipe <title> [options]

ARGUMENTS
  title                 Bug title (required)

OPTIONS
  -s, --sev <level>     Severity: low | medium | high | critical   (default: high)
  -p, --project <name>  Project name
  -e, --env <env>       Environment: local | staging | prod
  -t, --tags <tags>     Comma-separated tags
```

```bash
npm run build 2>&1 | bug pipe "Build failed" -s high -p myapp
cat error.log | bug pipe "Server crash" -s critical -e prod
kubectl logs pod-web-1 2>&1 | bug pipe "Pod crash loop" -p infra -t kubernetes
```

### `bug list`

List bugs with optional filters.

```
USAGE
  bug list [options]

OPTIONS
  -p, --project <name>  Filter by project
  --status <status>     Filter by status: open | in-progress | resolved | wontfix
  --sev <level>         Filter by severity: low | medium | high | critical
  --limit <n>           Number of results   (default: 20)
```

```bash
bug list
bug list --status open
bug list --sev critical
bug list -p myapp --limit 50
bug list -p api --status in-progress --sev high
```

### `bug view <id>`

View full bug details including description, notes, metadata, and comments. Accepts a full ObjectId or 6-character short ID.

```
USAGE
  bug view <id>

ARGUMENTS
  id  Full ObjectId or 6-character short ID
```

```bash
bug view abc123
```

### `bug update <id>`

Update a bug's fields.

```
USAGE
  bug update <id> [options]

ARGUMENTS
  id  Full ObjectId or 6-character short ID

OPTIONS
  --status <status>     New status: open | in-progress | resolved | wontfix
  --sev <level>         New severity: low | medium | high | critical
  --notes <text>        Replace notes
  --tags <tags>         Replace tags (comma-separated)
```

```bash
bug update abc123 --status in-progress
bug update abc123 --sev critical --notes "narrowed to auth middleware"
bug update abc123 --tags nestjs,redis,queue
```

### `bug resolve <id>`

Shortcut to mark a bug as resolved.

```
USAGE
  bug resolve <id>
```

```bash
bug resolve abc123
```

### `bug wontfix <id>`

Shortcut to mark a bug as won't fix.

```
USAGE
  bug wontfix <id>
```

```bash
bug wontfix abc123
```

---

## All options reference

| Flag | Long | Commands | Description |
|------|------|----------|-------------|
| `-p` | `--project <name>` | log, pipe, list | Project name |
| `-s` | `--sev <level>` | log, pipe, list | Severity |
| `-e` | `--env <env>` | log, pipe | Environment |
| `-d` | `--desc <text>` | log | Description |
| `-n` | `--notes <text>` | log, update | Notes |
| `-t` | `--tags <tags>` | log, pipe, update | Comma-separated tags |
| | `--status <status>` | list, update | Status filter or value |
| | `--limit <n>` | list | Max results |

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BUGIT_API_URL` | `https://bugit-j70c.onrender.com` | API endpoint |

---

## Real-world workflows

```bash
# Catch a failing build
npm run build 2>&1 | bug pipe "Build failed" -s high -p webapp

# Log a production incident from a log file
ssh prod tail -100 /var/log/app/error.log | bug pipe "Prod 500s" -s critical -e prod

# Triage your open bugs
bug list --status open --sev critical

# Investigate and update
bug view a1b2c3
bug update a1b2c3 --status in-progress --notes "looking into it"

# Mark resolved after deploy
bug resolve a1b2c3
```

---

## Web dashboard

Review, filter, and comment on bugs at [bugit-dev.vercel.app](https://bugit-dev.vercel.app).

---

## License

MIT
