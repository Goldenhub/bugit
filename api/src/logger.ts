import pino from 'pino';

export function createLogger() {
  const targets: pino.TransportTargetOptions[] = [];

  if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
    targets.push({
      target: '@axiomhq/pino',
      options: {
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_TOKEN,
      },
    });
  }

  if (targets.length === 0) {
    return pino({ level: process.env.LOG_LEVEL ?? 'info' });
  }

  return pino({
    level: process.env.LOG_LEVEL ?? 'info',
    transport: { targets },
  });
}
