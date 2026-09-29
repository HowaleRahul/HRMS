import pool from './server/config/db.js';

const unlock = async () => {
  try {
    await pool.execute('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = "admin@hrms.com"');
    console.log('Account unlocked!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

unlock();
