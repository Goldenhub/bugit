import chalk from 'chalk';
import Table from 'cli-table3';

const SEV_COLOR = {
  critical: chalk.red,
  high: chalk.yellow,
  medium: chalk.blue,
  low: chalk.gray,
};

const STATUS_COLOR = {
  open: chalk.yellow,
  'in-progress': chalk.blue,
  resolved: chalk.green,
  wontfix: chalk.gray,
};

export function colorSev(s) {
  return (SEV_COLOR[s] ?? chalk.white)(s);
}

export function colorStatus(s) {
  return (STATUS_COLOR[s] ?? chalk.white)(s);
}

export function shortId(id) {
  return String(id).slice(0, 6);
}

export function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

export function printBugTable(bugs) {
  const table = new Table({
    head: ['ID', 'TITLE', 'PROJECT', 'SEV', 'STATUS', 'DATE'].map((h) =>
      chalk.bold(h),
    ),
    colWidths: [8, 42, 14, 10, 13, 12],
    style: { compact: true },
  });

  for (const bug of bugs) {
    const date = new Date(bug.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    table.push([
      chalk.dim(shortId(bug._id)),
      truncate(bug.title, 40),
      truncate(bug.project, 12),
      colorSev(bug.severity),
      colorStatus(bug.status),
      date,
    ]);
  }

  console.log(table.toString());
}

export function printBugDetail(bug, comments = []) {
  const line = chalk.dim('─'.repeat(60));
  console.log();
  console.log(chalk.bold(bug.title));
  console.log(line);
  console.log(`${chalk.dim('ID')}          ${shortId(bug._id)} (${bug._id})`);
  console.log(`${chalk.dim('Project')}     ${bug.project || '-'}`);
  console.log(`${chalk.dim('Severity')}    ${colorSev(bug.severity)}`);
  console.log(`${chalk.dim('Status')}      ${colorStatus(bug.status)}`);
  console.log(`${chalk.dim('Environment')} ${bug.environment || '-'}`);
  console.log(`${chalk.dim('Source')}      ${bug.source}`);
  console.log(`${chalk.dim('Tags')}        ${bug.tags?.join(', ') || '-'}`);
  console.log(
    `${chalk.dim('Created')}     ${new Date(bug.createdAt).toLocaleString()}`,
  );

  if (bug.description) {
    console.log();
    console.log(chalk.bold('Description'));
    console.log(bug.description);
  }

  if (bug.notes) {
    console.log();
    console.log(chalk.bold('Notes'));
    console.log(bug.notes);
  }

  if (Object.keys(bug.metadata ?? {}).length) {
    console.log();
    console.log(chalk.bold('Metadata'));
    console.log(JSON.stringify(bug.metadata, null, 2));
  }

  if (comments.length) {
    console.log();
    console.log(chalk.bold(`Comments (${comments.length})`));
    console.log(line);
    for (const c of comments) {
      console.log(
        `${chalk.dim(new Date(c.createdAt).toLocaleString())}  ${c.body}`,
      );
    }
  }

  console.log();
}
