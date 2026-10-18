const { PrismaClient } = require('@prisma/client');

// Neon serverless Postgres goes idle and drops connections after inactivity.
// Adding connect_timeout/pool_timeout to the URL keeps things stable. On Vercel
// every function instance gets its own pool, so keep it at 1 connection and use
// Neon's pooled (-pooler) host. Prisma's datasourceUrl override appends params
// without requiring an env-var change.
function buildDatabaseUrl() {
  const base = process.env.DATABASE_URL || '';
  try {
    const url = new URL(base);
    // Ensure we use the pooler endpoint params Neon needs
    if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '15');
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '15');
    if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1');
    if (url.hostname.includes('-pooler') && !url.searchParams.has('pgbouncer')) url.searchParams.set('pgbouncer', 'true');
    return url.toString();
  } catch {
    return base;
  }
}

function createPrismaClient() {
  return new PrismaClient({
    datasourceUrl: buildDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

// Singleton — prevents exhausting DB connections via hot-reload in dev
const prisma = global.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// Warm up the connection on startup; log but don't crash if Neon is still waking
prisma.$connect().catch((err) => {
  console.warn('[prisma] Initial connection attempt failed (Neon may be waking up):', err.message);
});

module.exports = prisma;
