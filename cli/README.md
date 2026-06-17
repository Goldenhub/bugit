# bugit-cli

Log bugs from your terminal without breaking your flow.

```bash
npm install -g bugit-cli
```

## Authentication

```bash
bug login     # opens a browser tab to authenticate
bug whoami    # show your email and API endpoint
bug logout    # clear stored credentials
```

## Commands

### Log a bug

```bash
bug log "Login crashes on Safari 17"
bug log "Checkout 500 on mobile" -s critical -p storefront -e prod
bug log "Slow query on reports page" -s medium -p api -t postgres,performance
bug log "Build failing" -s high --desc "Error: cannot find module 'react'"
```

**Options**

| Flag | Description | Default |
|------|-------------|---------|
| `-s, --sev` | `low` \| `medium` \| `high` \| `critical` | `medium` |
| `-p, --project` | Project name | |
| `-e, --env` | `local` \| `staging` \| `prod` | |
| `-d, --desc` | Description or steps to reproduce | |
| `-n, --notes` | Root cause or fix notes | |
| `-t, --tags` | Comma-separated tags | |

### Pipe from stdin

Pipe build errors, stack traces, or any output directly into a bug.

```bash
npm run build 2>&1 | bug pipe "Build failed" -s high -p myapp
cat error.log | bug pipe "Server crash" -s critical -e prod
```

### List bugs

```bash
bug list                        # all bugs, last 20
bug list --status open
bug list --sev critical
bug list -p myapp --limit 50
```

### View a bug

```bash
bug view <id>                   # accepts full ID or short 6-char ID
```

### Update a bug

```bash
bug update <id> --status in-progress
bug update <id> --sev critical --notes "narrowed to auth middleware"
bug update <id> --tags nestjs,redis
```

### Shortcuts

```bash
bug resolve <id>    # set status to resolved
bug wontfix <id>    # set status to wontfix
```

## Web dashboard

Review, filter, and comment on bugs at [https://bugit-dev.vercel.app](https://bugit-dev.vercel.app).

## License

MIT
