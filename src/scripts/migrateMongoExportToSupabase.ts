import fs from 'node:fs/promises';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeExtendedJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeExtendedJson);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  if ('$oid' in value) {
    return String(value.$oid ?? '');
  }

  if ('$date' in value) {
    const dateValue = value.$date;

    if (typeof dateValue === 'string') {
      return dateValue;
    }

    if (isPlainObject(dateValue) && '$numberLong' in dateValue) {
      return new Date(Number(dateValue.$numberLong)).toISOString();
    }

    return String(dateValue ?? '');
  }

  if ('$numberInt' in value) {
    return Number(value.$numberInt ?? 0);
  }

  if ('$numberLong' in value) {
    return Number(value.$numberLong ?? 0);
  }

  if ('$numberDouble' in value) {
    return Number(value.$numberDouble ?? 0);
  }

  if ('$numberDecimal' in value) {
    return Number(value.$numberDecimal ?? 0);
  }

  const out: PlainObject = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    out[key] = normalizeExtendedJson(nestedValue);
  }

  return out;
}

function asString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = normalizeExtendedJson(value);
  if (typeof normalized === 'string') {
    return normalized;
  }

  if (typeof normalized === 'number' || typeof normalized === 'boolean') {
    return String(normalized);
  }

  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const normalized = normalizeExtendedJson(value);
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asDate(value: unknown): Date | null {
  const maybeString = asString(value);
  if (!maybeString) {
    return null;
  }

  const parsed = new Date(maybeString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(asString)
    .filter((item): item is string => Boolean(item));
}

function asIntArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asNumber(item, Number.NaN))
    .filter((item) => Number.isFinite(item))
    .map((item) => Math.trunc(item));
}

async function readCollection(exportDir: string, names: string[]): Promise<PlainObject[]> {
  for (const name of names) {
    const filePath = path.join(exportDir, `${name}.json`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const trimmed = raw.trim();

      if (!trimmed) {
        return [];
      }

      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed) as unknown[];
        return parsed
          .map(normalizeExtendedJson)
          .filter(isPlainObject);
      }

      const records = trimmed
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => normalizeExtendedJson(JSON.parse(line)))
        .filter(isPlainObject);

      return records;
    } catch {
      continue;
    }
  }

  return [];
}

function mongoId(doc: PlainObject): string | null {
  return asString(doc._id ?? doc.id);
}

function jsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  const normalized = normalizeExtendedJson(value);
  if (
    typeof normalized === 'string' ||
    typeof normalized === 'number' ||
    typeof normalized === 'boolean' ||
    Array.isArray(normalized) ||
    isPlainObject(normalized)
  ) {
    return normalized as Prisma.InputJsonValue;
  }

  return undefined;
}

async function main() {
  const exportDir = process.env.MONGO_EXPORT_DIR ?? path.join(process.cwd(), 'mongo-export');
  console.log(`Reading mongo exports from: ${exportDir}`);

  const users = await readCollection(exportDir, ['User', 'Users', 'user', 'users']);
  const accounts = await readCollection(exportDir, ['Account', 'Accounts', 'account', 'accounts']);
  const sessions = await readCollection(exportDir, ['Session', 'Sessions', 'session', 'sessions']);
  const gradillas = await readCollection(exportDir, ['Gradilla', 'Gradillas', 'gradilla', 'gradillas']);
  const tubes = await readCollection(exportDir, ['Tube', 'Tubes', 'tube', 'tubes']);
  const auditLogs = await readCollection(exportDir, ['AuditLog', 'AuditLogs', 'auditlog', 'auditlogs']);
  const reagents = await readCollection(exportDir, ['Reagent', 'Reagents', 'reagent', 'reagents']);
  const stocks = await readCollection(exportDir, ['Stock', 'Stocks', 'stock', 'stocks']);

  console.log('Found records:', {
    users: users.length,
    accounts: accounts.length,
    sessions: sessions.length,
    gradillas: gradillas.length,
    tubes: tubes.length,
    auditLogs: auditLogs.length,
    reagents: reagents.length,
    stocks: stocks.length,
  });

  const userIds = new Set<string>();
  const gradillaIds = new Set<string>();
  const reagentIds = new Set<string>();

  let skipped = 0;

  for (const doc of users) {
    const id = mongoId(doc);
    if (!id) {
      skipped++;
      continue;
    }

    await prisma.user.upsert({
      where: { id },
      update: {
        name: asString(doc.name),
        email: asString(doc.email),
        emailVerified: asBoolean(doc.emailVerified, false),
        image: asString(doc.image),
        password: asString(doc.password),
        maxGrids: Math.trunc(asNumber(doc.maxGrids, 2)),
        maxTubes: Math.trunc(asNumber(doc.maxTubes, 162)),
        isUnlimited: asBoolean(doc.isUnlimited, false),
        verificationCode: asString(doc.verificationCode),
        createdAt: asDate(doc.createdAt) ?? new Date(),
        updatedAt: asDate(doc.updatedAt) ?? new Date(),
        isMainUser: asBoolean(doc.isMainUser, true),
        resetToken: asString(doc.resetToken),
        resetTokenExpiry: asDate(doc.resetTokenExpiry),
      },
      create: {
        id,
        name: asString(doc.name),
        email: asString(doc.email),
        emailVerified: asBoolean(doc.emailVerified, false),
        image: asString(doc.image),
        password: asString(doc.password),
        maxGrids: Math.trunc(asNumber(doc.maxGrids, 2)),
        maxTubes: Math.trunc(asNumber(doc.maxTubes, 162)),
        isUnlimited: asBoolean(doc.isUnlimited, false),
        verificationCode: asString(doc.verificationCode),
        createdAt: asDate(doc.createdAt) ?? new Date(),
        updatedAt: asDate(doc.updatedAt) ?? new Date(),
        isMainUser: asBoolean(doc.isMainUser, true),
        resetToken: asString(doc.resetToken),
        resetTokenExpiry: asDate(doc.resetTokenExpiry),
      },
    });

    userIds.add(id);
  }

  for (const doc of users) {
    const id = mongoId(doc);
    const mainUserId = asString(doc.mainUserId);

    if (!id || !mainUserId || !userIds.has(id) || !userIds.has(mainUserId)) {
      continue;
    }

    await prisma.user.update({
      where: { id },
      data: { mainUserId },
    });
  }

  for (const doc of accounts) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);

    if (!id || !userId || !userIds.has(userId)) {
      skipped++;
      continue;
    }

    await prisma.account.upsert({
      where: { id },
      update: {
        userId,
        type: asString(doc.type) ?? 'credentials',
        provider: asString(doc.provider) ?? 'credentials',
        providerAccountId: asString(doc.providerAccountId) ?? id,
        refresh_token: asString(doc.refresh_token),
        access_token: asString(doc.access_token),
        expires_at: Math.trunc(asNumber(doc.expires_at, 0)) || null,
        token_type: asString(doc.token_type),
        scope: asString(doc.scope),
        id_token: asString(doc.id_token),
        session_state: asString(doc.session_state),
      },
      create: {
        id,
        userId,
        type: asString(doc.type) ?? 'credentials',
        provider: asString(doc.provider) ?? 'credentials',
        providerAccountId: asString(doc.providerAccountId) ?? id,
        refresh_token: asString(doc.refresh_token),
        access_token: asString(doc.access_token),
        expires_at: Math.trunc(asNumber(doc.expires_at, 0)) || null,
        token_type: asString(doc.token_type),
        scope: asString(doc.scope),
        id_token: asString(doc.id_token),
        session_state: asString(doc.session_state),
      },
    });
  }

  for (const doc of sessions) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);

    if (!id || !userId || !userIds.has(userId)) {
      skipped++;
      continue;
    }

    await prisma.session.upsert({
      where: { id },
      update: {
        sessionToken: asString(doc.sessionToken) ?? id,
        userId,
        expires: asDate(doc.expires) ?? new Date(),
      },
      create: {
        id,
        sessionToken: asString(doc.sessionToken) ?? id,
        userId,
        expires: asDate(doc.expires) ?? new Date(),
      },
    });
  }

  for (const doc of gradillas) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);

    if (!id || !userId || !userIds.has(userId)) {
      skipped++;
      continue;
    }

    await prisma.gradilla.upsert({
      where: { id },
      update: {
        name: asString(doc.name) ?? `Gradilla ${id}`,
        description: asString(doc.description),
        storagePlace: asString(doc.storagePlace),
        temperature: asString(doc.temperature),
        rows: asStringArray(doc.rows),
        columns: asIntArray(doc.columns),
        fields: asStringArray(doc.fields),
        createdAt: asDate(doc.createdAt) ?? new Date(),
        updatedAt: asDate(doc.updatedAt) ?? new Date(),
        userId,
      },
      create: {
        id,
        name: asString(doc.name) ?? `Gradilla ${id}`,
        description: asString(doc.description),
        storagePlace: asString(doc.storagePlace),
        temperature: asString(doc.temperature),
        rows: asStringArray(doc.rows),
        columns: asIntArray(doc.columns),
        fields: asStringArray(doc.fields),
        createdAt: asDate(doc.createdAt) ?? new Date(),
        updatedAt: asDate(doc.updatedAt) ?? new Date(),
        userId,
      },
    });

    gradillaIds.add(id);
  }

  for (const doc of tubes) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);
    const gradillaId = asString(doc.gradillaId);

    if (!id || !userId || !gradillaId || !userIds.has(userId) || !gradillaIds.has(gradillaId)) {
      skipped++;
      continue;
    }

    await prisma.tube.upsert({
      where: { id },
      update: {
        position: asString(doc.position) ?? '',
        data: jsonValue(doc.data) ?? {},
        gradillaId,
        userId,
      },
      create: {
        id,
        position: asString(doc.position) ?? '',
        data: jsonValue(doc.data) ?? {},
        gradillaId,
        userId,
      },
    });
  }

  for (const doc of auditLogs) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);

    if (!id || !userId || !userIds.has(userId)) {
      skipped++;
      continue;
    }

    await prisma.auditLog.upsert({
      where: { id },
      update: {
        action: asString(doc.action) ?? 'unknown',
        entityType: asString(doc.entityType) ?? 'unknown',
        entityId: asString(doc.entityId) ?? '',
        details: jsonValue(doc.details) ?? {},
        createdAt: asDate(doc.createdAt) ?? new Date(),
        userId,
      },
      create: {
        id,
        action: asString(doc.action) ?? 'unknown',
        entityType: asString(doc.entityType) ?? 'unknown',
        entityId: asString(doc.entityId) ?? '',
        details: jsonValue(doc.details) ?? {},
        createdAt: asDate(doc.createdAt) ?? new Date(),
        userId,
      },
    });
  }

  for (const doc of reagents) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);

    if (!id || !userId || !userIds.has(userId)) {
      skipped++;
      continue;
    }

    await prisma.reagent.upsert({
      where: { id },
      update: {
        name: asString(doc.name) ?? `Reagent ${id}`,
        description: asString(doc.description),
        unit: asString(doc.unit) ?? 'unit',
        lowStockAlert: Math.trunc(asNumber(doc.lowStockAlert, 0)),
        createdAt: asDate(doc.createdAt) ?? new Date(),
        updatedAt: asDate(doc.updatedAt) ?? new Date(),
        userId,
      },
      create: {
        id,
        name: asString(doc.name) ?? `Reagent ${id}`,
        description: asString(doc.description),
        unit: asString(doc.unit) ?? 'unit',
        lowStockAlert: Math.trunc(asNumber(doc.lowStockAlert, 0)),
        createdAt: asDate(doc.createdAt) ?? new Date(),
        updatedAt: asDate(doc.updatedAt) ?? new Date(),
        userId,
      },
    });

    reagentIds.add(id);
  }

  for (const doc of stocks) {
    const id = mongoId(doc);
    const userId = asString(doc.userId);
    const reagentId = asString(doc.reagentId);

    if (!id || !userId || !reagentId || !userIds.has(userId) || !reagentIds.has(reagentId)) {
      skipped++;
      continue;
    }

    await prisma.stock.upsert({
      where: { id },
      update: {
        reagentId,
        quantity: asNumber(doc.quantity, 0),
        lotNumber: asString(doc.lotNumber) ?? '',
        expirationDate: asDate(doc.expirationDate) ?? new Date(),
        entryDate: asDate(doc.entryDate) ?? new Date(),
        disposalDate: asDate(doc.disposalDate),
        durationDays: Math.trunc(asNumber(doc.durationDays, 0)) || null,
        isActive: asBoolean(doc.isActive, true),
        notes: asString(doc.notes),
        userId,
      },
      create: {
        id,
        reagentId,
        quantity: asNumber(doc.quantity, 0),
        lotNumber: asString(doc.lotNumber) ?? '',
        expirationDate: asDate(doc.expirationDate) ?? new Date(),
        entryDate: asDate(doc.entryDate) ?? new Date(),
        disposalDate: asDate(doc.disposalDate),
        durationDays: Math.trunc(asNumber(doc.durationDays, 0)) || null,
        isActive: asBoolean(doc.isActive, true),
        notes: asString(doc.notes),
        userId,
      },
    });
  }

  console.log(`Migration completed. Skipped records: ${skipped}`);
}

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
