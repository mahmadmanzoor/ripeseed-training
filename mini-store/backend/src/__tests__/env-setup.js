// Set NODE_ENV to test for all Jest tests
process.env.NODE_ENV = 'test';

// Set test database URL
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://ahmad@localhost:5432/mini_store_test_db';
