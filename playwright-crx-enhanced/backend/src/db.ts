import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_USER = process.env.DB_USER || 'playwright_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'playwright123';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'playwright_crx';

const rawEnvUrl = process.env.DATABASE_URL;
const envUrl = typeof rawEnvUrl === 'string' ? rawEnvUrl.trim() : '';

// Validate DATABASE_URL format before using
const isValidUrl = envUrl.length > 0 &&
  (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'));

const connectionString = isValidUrl
  ? envUrl
  : `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const ssl =
  process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined;

const pool = new Pool({
  connectionString,
  ssl,
  // Fix for PostgreSQL case sensitivity issues
  // Force all identifiers to be quoted to preserve case
  // This ensures "createdAt" is treated as a proper identifier, not "createdat"
  query_timeout: 30000,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

export default pool;
