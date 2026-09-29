import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getAll = async (filters) => {
  const { search, role_id, is_active, limit, offset } = filters;
  let query = `
    SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.created_at, r.name as role_name, r.display_name as role_display_name, e.first_name, e.last_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.is_deleted = 0
  `;
  const params = [];

  if (search) { 
    query += ' AND (u.username LIKE ? OR u.email LIKE ? OR e.first_name LIKE ?)'; 
    const term = `%\${search}%`;
    params.push(term, term, term); 
  }
  if (role_id) { query += ' AND u.role_id = ?'; params.push(role_id); }
  if (is_active !== undefined) { query += ' AND u.is_active = ?'; params.push(is_active); }

  query += ' ORDER BY u.created_at DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getCount = async (filters) => {
  const { search, role_id, is_active } = filters;
  let query = `
    SELECT COUNT(*) as count 
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.is_deleted = 0
  `;
  const params = [];

  if (search) { 
    query += ' AND (u.username LIKE ? OR u.email LIKE ? OR e.first_name LIKE ?)'; 
    const term = `%\${search}%`;
    params.push(term, term, term); 
  }
  if (role_id) { query += ' AND u.role_id = ?'; params.push(role_id); }
  if (is_active !== undefined) { query += ' AND u.is_active = ?'; params.push(is_active); }

  const [rows] = await pool.execute(query, params);
  return rows[0].count;
};

export const getById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.employee_id, r.name as role_name 
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.is_deleted = 0
  `, [id]);
  return rows[0];
};

export const create = async (data) => {
  const { username, email, password, role_id, employee_id } = data;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password, role_id, employee_id) VALUES (?, ?, ?, ?, ?)',
    [username, email, hashedPassword, role_id, employee_id || null]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const { username, email, role_id, is_active, employee_id } = data;
  await pool.execute(
    'UPDATE users SET username = ?, email = ?, role_id = ?, is_active = ?, employee_id = ? WHERE id = ?',
    [username, email, role_id, is_active, employee_id || null, id]
  );
};

export const softDelete = async (id) => {
  await pool.execute('UPDATE users SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

export const getRoles = async () => {
  const [rows] = await pool.execute('SELECT * FROM roles WHERE is_deleted = 0');
  return rows;
};

export const getRoleById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM roles WHERE id = ? AND is_deleted = 0', [id]);
  return rows[0];
};

export const createRole = async (data) => {
  const { name, display_name, description } = data;
  const [result] = await pool.execute(
    'INSERT INTO roles (name, display_name, description) VALUES (?, ?, ?)',
    [name, display_name, description]
  );
  return result.insertId;
};

export const updateRole = async (id, data) => {
  const { name, display_name, description } = data;
  await pool.execute(
    'UPDATE roles SET name = ?, display_name = ?, description = ? WHERE id = ?',
    [name, display_name, description, id]
  );
};

export const deleteRole = async (id) => {
  await pool.execute('UPDATE roles SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

export const getPermissions = async () => {
  const [rows] = await pool.execute('SELECT * FROM permissions');
  return rows;
};

export const getRolePermissions = async (roleId) => {
  const [rows] = await pool.execute(`
    SELECT p.* FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = ?
  `, [roleId]);
  return rows;
};

export const setRolePermissions = async (roleId, permissionIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
    
    if (permissionIds && permissionIds.length > 0) {
      const values = permissionIds.map(pid => [roleId, pid]);
      await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getPermissionsByModule = async () => {
  const [rows] = await pool.execute('SELECT * FROM permissions ORDER BY module');
  const grouped = {};
  rows.forEach(p => {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p);
  });
  return grouped;
};
