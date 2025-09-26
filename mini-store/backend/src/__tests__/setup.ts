import { PrismaClient } from '@prisma/client';

// Create a test database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://ahmad@localhost:5432/mini_store_test_db'
    }
  }
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Clean up test data
  await prisma.creditTransfer.deleteMany();
  await prisma.gift.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
});

// Global test teardown
afterAll(async () => {
  // Clean up test data
  await prisma.creditTransfer.deleteMany();
  await prisma.gift.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
  
  // Disconnect from database
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  await prisma.creditTransfer.deleteMany();
  await prisma.gift.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
});

export { prisma };
