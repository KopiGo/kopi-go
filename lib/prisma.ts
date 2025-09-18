import { PrismaClient } from '../app/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

if (global.prisma) {
  global.prisma.$disconnect();
}

export const prisma = global.prisma || new PrismaClient({
  log: ['query'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
