// Force test database URL for ALL Prisma clients BEFORE any imports
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://ahmad@localhost:5432/mini_store_test_db';
process.env.NODE_ENV = 'test';

// Clear any cached Prisma client
delete (globalThis as any).__prisma;

// Create a test-specific Prisma client that ALWAYS uses the test database
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://ahmad@localhost:5432/mini_store_test_db'
    }
  }
});

// Override the main Prisma client to use test database
import { prisma as mainPrisma } from '../lib/prisma';

// AGGRESSIVE DATABASE CLEANUP FUNCTION
async function cleanDatabase() {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.creditTransfer.deleteMany();
    await prisma.gift.deleteMany();
    await prisma.order.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.user.deleteMany();
    
    // Force a small delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.log('Database cleanup error (ignored):', error);
  }
}
// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // AGGRESSIVE INITIAL CLEANUP
  await cleanDatabase();
  
  // Reset database sequences if PostgreSQL
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "users", "payments", "orders", "gifts", "creditTransfers" RESTART IDENTITY CASCADE`;
  } catch (error) {
    // Fallback to individual cleanup if TRUNCATE fails
    await cleanDatabase();
  }
});

// Global test teardown
afterAll(async () => {
  // AGGRESSIVE FINAL CLEANUP
  await cleanDatabase();
  
  // Disconnect from database
  await prisma.$disconnect();
});

// Clean up after EVERY SINGLE TEST - NO EXCEPTIONS
afterEach(async () => {
  // AGGRESSIVE CLEANUP AFTER EACH TEST
  await cleanDatabase();
});

// Export prisma for use in tests
export { prisma };
