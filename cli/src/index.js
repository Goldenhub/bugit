#!/usr/bin/env node
import { program } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import open from 'open';
import { saveToken, clearToken, getToken, API_URL } from './config.js';
import { apiFetch, ApiError } from './api.js';
import { printBugTable, printBugDetail, colorSev, colorStatus, shortId } from './format.js';

function handleError(err) {
  if (err instanceof ApiError) {
    console.error(chalk.red(`Error: ${err.message}`));
  } else {
    console.error(chalk.red(`Unexpected error: ${err.message}`));
  }
  process.exit(1);
}

program.name('bug').description('BugIt CLI - log and review bugs fast').version('1.0.0');

// bug log
program
  .command('log <title>')
  .description('Log a new bug')
  .option('-p, --project <name>', 'project name')
  .option('-s, --sev <level>', 'severity: low|medium|high|critical', 'medium')
  .option('-e, --env <environment>', 'environment: local|staging|prod')
  .option('-d, --desc <text>', 'description / steps to reproduce')
  .option('-n, --notes <text>', 'root cause or fix notes')
  .option('-t, --tags <tags>', 'comma-separated tags')
  .option('--source <source>', 'source override', 'cli')
  .action(async (title, opts) => {
    const spinner = ora('Logging bug…').start();
    try {
      const body = {
        title,
        source: opts.source,
        severity: opts.sev,
        ...(opts.project && { project: opts.project }),
        ...(opts.env && { environment: opts.env }),
        ...(opts.desc && { description: opts.desc }),
        ...(opts.notes && { notes: opts.notes }),
        ...(opts.tags && { tags: opts.tags.split(',').map((t) => t.trim()) }),
      };
      const bug = await apiFetch('/bugs', { method: 'POST', body: JSON.stringify(body) });
      spinner.succeed(
        `Bug logged ${chalk.dim(shortId(bug._id))} - ${colorSev(bug.severity)} ${chalk.bold(bug.title)}`,
      );
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug list
program
  .command('list')
  .description('List bugs')
  .option('-p, --project <name>', 'filter by project')
  .option('--status <status>', 'filter by status')
  .option('--sev <level>', 'filter by severity')
  .option('--limit <n>', 'number of results', '20')
  .action(async (opts) => {
    const spinner = ora('Fetching bugs…').start();
    try {
      const params = new URLSearchParams({ limit: opts.limit });
      if (opts.project) params.set('project', opts.project);
      if (opts.status) params.set('status', opts.status);
      if (opts.sev) params.set('severity', opts.sev);

      const data = await apiFetch(`/bugs?${params}`);
      spinner.stop();

      if (!data.bugs.length) {
        console.log(chalk.dim('No bugs found.'));
        return;
      }

      printBugTable(data.bugs);
      console.log(chalk.dim(`Showing ${data.bugs.length} of ${data.total}`));
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug view
program
  .command('view <id>')
  .description('View full bug detail')
  .action(async (id) => {
    const spinner = ora('Fetching bug…').start();
    try {
      const [bug, comments] = await Promise.all([
        apiFetch(`/bugs/${id}`),
        apiFetch(`/bugs/${id}/comments`),
      ]);
      spinner.stop();
      printBugDetail(bug, comments);
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug update
program
  .command('update <id>')
  .description('Update a bug')
  .option('--status <status>', 'new status')
  .option('--sev <level>', 'new severity')
  .option('--notes <text>', 'replace notes')
  .option('--tags <tags>', 'replace tags (comma-separated)')
  .action(async (id, opts) => {
    const spinner = ora('Updating bug…').start();
    try {
      const body = {
        ...(opts.status && { status: opts.status }),
        ...(opts.sev && { severity: opts.sev }),
        ...(opts.notes && { notes: opts.notes }),
        ...(opts.tags && { tags: opts.tags.split(',').map((t) => t.trim()) }),
      };
      if (!Object.keys(body).length) {
        spinner.fail('No fields to update.');
        process.exit(1);
      }
      const bug = await apiFetch(`/bugs/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      spinner.succeed(
        `Updated ${chalk.dim(shortId(bug._id))} - status: ${colorStatus(bug.status)}, sev: ${colorSev(bug.severity)}`,
      );
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug resolve
program
  .command('resolve <id>')
  .description('Mark bug as resolved')
  .action(async (id) => {
    const spinner = ora('Resolving…').start();
    try {
      await apiFetch(`/bugs/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) });
      spinner.succeed(chalk.green(`Bug ${shortId(id)} resolved.`));
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug wontfix
program
  .command('wontfix <id>')
  .description("Mark bug as won't fix")
  .action(async (id) => {
    const spinner = ora('Updating…').start();
    try {
      await apiFetch(`/bugs/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'wontfix' }) });
      spinner.succeed(chalk.gray(`Bug ${shortId(id)} marked as wontfix.`));
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug pipe
program
  .command('pipe <title>')
  .description('Pipe stdin as bug description')
  .option('-p, --project <name>', 'project name')
  .option('-s, --sev <level>', 'severity', 'high')
  .option('-e, --env <environment>', 'environment')
  .option('-t, --tags <tags>', 'comma-separated tags')
  .option('--source <source>', 'source override', 'cli')
  .action(async (title, opts) => {
    let piped = '';
    if (!process.stdin.isTTY) {
      for await (const chunk of process.stdin) piped += chunk;
    }

    const spinner = ora('Logging bug from stdin…').start();
    try {
      const body = {
        title,
        source: opts.source,
        severity: opts.sev,
        description: piped.trim(),
        ...(opts.project && { project: opts.project }),
        ...(opts.env && { environment: opts.env }),
        ...(opts.tags && { tags: opts.tags.split(',').map((t) => t.trim()) }),
      };
      const bug = await apiFetch('/bugs', { method: 'POST', body: JSON.stringify(body) });
      spinner.succeed(
        `Piped bug logged ${chalk.dim(shortId(bug._id))} - ${colorSev(bug.severity)} ${chalk.bold(bug.title)}`,
      );
    } catch (err) {
      spinner.fail();
      handleError(err);
    }
  });

// bug login - device flow
program
  .command('login')
  .description('Authenticate via browser')
  .action(async () => {
    const spinner = ora('Starting authentication…').start();
    let code, url;
    try {
      const data = await apiFetch('/auth/cli/init', { method: 'POST' });
      code = data.code;
      url = data.url;
    } catch (err) {
      spinner.fail();
      handleError(err);
      return;
    }

    spinner.succeed('Opening browser…');
    console.log(chalk.dim(`If the browser doesn't open, visit:\n${url}`));
    await open(url);

    const pollSpinner = ora('Waiting for browser authentication…').start();
    const deadline = Date.now() + 5 * 60 * 1000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const result = await apiFetch(`/auth/cli/session/${code}`);
        if (result.status === 'approved') {
          saveToken(result.token);
          pollSpinner.succeed(chalk.green('Authenticated! You can now use the bug CLI.'));
          return;
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          pollSpinner.fail('Session expired. Run bug login again.');
          return;
        }
      }
    }

    pollSpinner.fail('Timed out waiting for authentication.');
  });

// bug logout
program
  .command('logout')
  .description('Sign out and remove stored token')
  .action(() => {
    clearToken();
    console.log(chalk.dim('Signed out. Run bug login to authenticate again.'));
  });

// bug whoami
program
  .command('whoami')
  .description('Show authentication status')
  .action(async () => {
    const token = getToken();
    if (!token) {
      console.log(chalk.yellow('Not authenticated. Run: bug login'));
      return;
    }
    try {
      const { email } = await apiFetch('/auth/me');
      console.log(chalk.green(email) + chalk.dim(` → ${API_URL}`));
    } catch {
      console.log(chalk.yellow('Token stored but could not reach API.'));
    }
  });

program.parse();
