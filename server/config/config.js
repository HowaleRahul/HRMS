import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

if (isProduction) {
  if (!jwtSecret || jwtSecret.length < 32 || !jwtRefreshSecret || jwtRefreshSecret.length < 32 || jwtSecret === jwtRefreshSecret) {
    throw new Error('Production requires distinct JWT_SECRET and JWT_REFRESH_SECRET values of at least 32 characters.');
  }
  if (!process.env.DB_PASSWORD || !process.env.DB_USER || process.env.DB_USER === 'root') {
    throw new Error('Production requires a password-protected, non-root database user.');
  }
  if (new URL(clientUrl).protocol !== 'https:') {
    throw new Error('Production CLIENT_URL must use HTTPS.');
  }
}

export const config = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'hrms_db',
  },
  jwt: {
    secret: jwtSecret || randomBytes(32).toString('hex'),
    refreshSecret: jwtRefreshSecret || randomBytes(32).toString('hex'),
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  uploads: {
    dir: process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, '..', 'uploads'),
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
  clientUrl,
};
