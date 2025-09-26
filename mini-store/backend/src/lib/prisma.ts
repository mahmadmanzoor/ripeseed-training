import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use test database when running tests - be more aggressive
const databaseUrl = process.env.NODE_ENV === 'test' 
  ? (process.env.TEST_DATABASE_URL || 'postgresql://ahmad@localhost:5432/mini_store_test_db')
  : process.env.DATABASE_URL;

// Always clear cached client in test mode
if (process.env.NODE_ENV === 'test') {
  delete globalForPrisma.prisma;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
