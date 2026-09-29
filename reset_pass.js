import bcrypt from 'bcryptjs';
import pool from './server/config/db.js';

const reset = async () => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE email = "admin@hrms.com"', [hash]);
    console.log('Password reset to: admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

reset();
