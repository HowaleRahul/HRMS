import bcrypt from 'bcryptjs';
import pool from './config/db.js';

const reset = async () => {
  try {
    const hash = await bcrypt.hash('Admin123', 10);
    await pool.execute('UPDATE users SET password_hash = ?, login_attempts = 0, locked_until = NULL WHERE email = "admin@hrms.com"', [hash]);
    console.log('Password reset to: Admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

reset();
