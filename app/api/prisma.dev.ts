import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across hot-reloads in development. Without this,
// Next.js re-instantiates the client on every reload, exhausting DB connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
