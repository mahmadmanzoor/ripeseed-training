export const CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/mini_store_db'
} as const;

export const DEFAULT_WALLET_CREDIT = 1000.00;
