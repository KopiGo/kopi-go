import { PrismaClient } from '../app/generated/prisma';

// Gunakan singleton agar tidak membuat banyak koneksi & menghindari "Engine is not yet connected"
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Catatan: JANGAN panggil prisma.$disconnect() di file ini atau di setiap handler API.
