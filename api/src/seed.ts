import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/bugit';

const BugSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    severity: String,
    status: String,
    project: String,
    environment: String,
    source: String,
    tags: [String],
    notes: String,
    metadata: Object,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const Bug = mongoose.model('Bug', BugSchema);

const seeds = [
  {
    title: 'BullMQ job silently drops on 429 response',
    description:
      'When the upstream API returns 429, the BullMQ worker swallows the error without retrying. Job disappears from queue.',
    severity: 'high',
    status: 'open',
    project: 'heirmpire',
    environment: 'staging',
    source: 'cli',
    tags: ['nestjs', 'bullmq', 'queue'],
    notes: '',
    metadata: { file: 'src/workers/upload.worker.ts', lineNumber: 42 },
  },
  {
    title: 'Prisma decimal field returns string instead of number',
    description:
      'findOneAndUpdate with $inc on a Decimal128 field returns the value as a string in the response payload.',
    severity: 'medium',
    status: 'open',
    project: 'billkit',
    environment: 'local',
    source: 'cli',
    tags: ['prisma', 'mongodb', 'types'],
    notes: 'May need to coerce with parseFloat in the service layer.',
    metadata: {},
  },
  {
    title: 'Webhook signature verification fails intermittently',
    description:
      'About 1 in 50 webhook calls from Stripe fails HMAC verification. Only happens under load. Suspect timing issue with raw body parsing.',
    severity: 'critical',
    status: 'in-progress',
    project: 'heirmpire',
    environment: 'prod',
    source: 'web',
    tags: ['stripe', 'webhook', 'security'],
    notes:
      'Added rawBody middleware. Watching logs. May be related to body-parser consuming the stream.',
    metadata: { url: '/webhooks/stripe' },
  },
  {
    title: 'Invoice PDF generation hangs on special characters',
    description:
      'Generating a PDF with € or £ symbols in the line item description causes the puppeteer process to hang indefinitely.',
    severity: 'high',
    status: 'resolved',
    project: 'billkit',
    environment: 'local',
    source: 'web',
    tags: ['puppeteer', 'pdf', 'encoding'],
    notes:
      'Fixed by setting UTF-8 charset in the HTML template head. Was missing <meta charset="utf-8">.',
    metadata: {},
  },
  {
    title: 'Dashboard stats API returns 0 for all counts after midnight UTC',
    description:
      'The /stats endpoint returns zeros for all status counts between 00:00 and 00:05 UTC. Likely a cache flush + cold query race condition.',
    severity: 'low',
    status: 'open',
    project: 'heirmpire',
    environment: 'prod',
    source: 'web',
    tags: ['caching', 'aggregation', 'mongodb'],
    notes: '',
    metadata: {},
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Bug.deleteMany({});
  console.log('Cleared existing bugs');

  await Bug.insertMany(seeds);
  console.log(`Inserted ${seeds.length} seed bugs`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
