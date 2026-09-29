import pool from '../config/db.js';

export const findUserByUsername = async (username) => {
  const [rows] = await pool.execute(`
    SELECT u.*, r.name as role_name, r.display_name as role_display_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.username = ? AND u.is_deleted = 0
  `, [username]);
  return rows[0] || null;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(`
    SELECT u.*, r.name as role_name, r.display_name as role_display_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ? AND u.is_deleted = 0
  `, [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT u.*, r.name as role_name, r.display_name as role_display_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.is_deleted = 0
  `, [id]);
  return rows[0] || null;
};

export const updateLastLogin = async (userId) => {
  await pool.execute(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
    [userId]
  );
};

export const incrementLoginAttempts = async (userId) => {
  await pool.execute(
    'UPDATE users SET login_attempts = COALESCE(login_attempts, 0) + 1 WHERE id = ?',
    [userId]
  );
};

export const resetLoginAttempts = async (userId) => {
  await pool.execute(
    'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?',
    [userId]
  );
};

export const lockAccount = async (userId, until) => {
  await pool.execute(
    'UPDATE users SET locked_until = ? WHERE id = ?',
    [until, userId]
  );
};

export const setPasswordResetToken = async (userId, token, expires) => {
  await pool.execute(
    'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
    [token, expires, userId]
  );
};

export const findByResetToken = async (token) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE password_reset_token = ? AND is_deleted = 0',
    [token]
  );
  return rows[0] || null;
};

export const updatePassword = async (userId, hashedPassword) => {
  await pool.execute(
    'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
    [hashedPassword, userId]
  );
};

export const getUserPermissions = async (roleId) => {
  const [rows] = await pool.execute(`
    SELECT p.module, p.action 
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = ?
  `, [roleId]);
  return rows;
};
