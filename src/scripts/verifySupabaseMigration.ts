import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../lib/prisma';

type CollectionName =
  | 'User'
  | 'Account'
  | 'Session'
  | 'Gradilla'
  | 'Tube'
  | 'AuditLog'
  | 'Reagent'
  | 'Stock';

const COLLECTIONS: CollectionName[] = [
  'User',
  'Account',
  'Session',
  'Gradilla',
  'Tube',
  'AuditLog',
  'Reagent',
  'Stock',
];

async function countExportRecords(exportDir: string, collection: CollectionName): Promise<number> {
  const filePath = path.join(exportDir, `${collection}.json`);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const trimmed = raw.trim();

    if (!trimmed) {
      return 0;
    }

    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed) as unknown[];
      return parsed.length;
    }

    return trimmed
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean).length;
  } catch {
    return 0;
  }
}

async function getDbCounts() {
  const [
    users,
    accounts,
    sessions,
    gradillas,
    tubes,
    auditLogs,
    reagents,
    stocks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.session.count(),
    prisma.gradilla.count(),
    prisma.tube.count(),
    prisma.auditLog.count(),
    prisma.reagent.count(),
    prisma.stock.count(),
  ]);

  return {
    User: users,
    Account: accounts,
    Session: sessions,
    Gradilla: gradillas,
    Tube: tubes,
    AuditLog: auditLogs,
    Reagent: reagents,
    Stock: stocks,
  };
}

function printRow(name: string, source: number, target: number) {
  const delta = target - source;
  const status = delta === 0 ? 'OK' : delta > 0 ? 'EXTRA_IN_DB' : 'MISSING_IN_DB';
  console.log(
    `${name.padEnd(13)} source=${String(source).padStart(6)} target=${String(target).padStart(6)} delta=${String(delta).padStart(6)} ${status}`
  );
}

async function main() {
  const exportDir = process.env.MONGO_EXPORT_DIR ?? path.join(process.cwd(), 'mongo-export');
  const strictMode = process.env.STRICT_COUNTS === 'true';

  console.log(`Verifying migration with exports at: ${exportDir}`);
  console.log(`Strict mode: ${strictMode ? 'enabled' : 'disabled'}`);

  const sourceCounts: Record<CollectionName, number> = {
    User: 0,
    Account: 0,
    Session: 0,
    Gradilla: 0,
    Tube: 0,
    AuditLog: 0,
    Reagent: 0,
    Stock: 0,
  };

  for (const collection of COLLECTIONS) {
    sourceCounts[collection] = await countExportRecords(exportDir, collection);
  }

  const targetCounts = await getDbCounts();

  console.log('\nCount comparison:');
  for (const collection of COLLECTIONS) {
    printRow(collection, sourceCounts[collection], targetCounts[collection]);
  }

  const hasMismatch = COLLECTIONS.some(
    (collection) => sourceCounts[collection] !== targetCounts[collection]
  );

  if (hasMismatch && strictMode) {
    throw new Error('Count mismatch detected and STRICT_COUNTS=true');
  }

  const usersWithInvalidMainUser = await prisma.user.count({
    where: {
      mainUserId: { not: null },
      mainUser: null,
    },
  });

  if (usersWithInvalidMainUser > 0) {
    console.warn(`Warning: ${usersWithInvalidMainUser} users have invalid mainUserId references.`);
  } else {
    console.log('\nReference check: User.mainUserId relations look valid.');
  }
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
