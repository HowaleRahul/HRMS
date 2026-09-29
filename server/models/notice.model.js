import pool from '../config/db.js';

export const getAll = async (filters) => {
  const { type, target_audience, is_active, search, limit, offset } = filters;
  let query = `
    SELECT n.*, u.username as published_by_username
    FROM notices n
    LEFT JOIN users u ON n.published_by = u.id
    WHERE n.is_deleted = 0
  `;
  const params = [];

  if (type) { query += ' AND n.type = ?'; params.push(type); }
  if (target_audience) { query += ' AND n.target_audience = ?'; params.push(target_audience); }
  if (is_active !== undefined) { query += ' AND n.is_active = ?'; params.push(is_active); }
  if (search) { 
    query += ' AND (n.title LIKE ? OR n.content LIKE ?)'; 
    const term = `%\${search}%`;
    params.push(term, term); 
  }

  query += ' ORDER BY n.created_at DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getCount = async (filters) => {
  const { type, target_audience, is_active, search } = filters;
  let query = 'SELECT COUNT(*) as count FROM notices WHERE is_deleted = 0';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (target_audience) { query += ' AND target_audience = ?'; params.push(target_audience); }
  if (is_active !== undefined) { query += ' AND is_active = ?'; params.push(is_active); }
  if (search) { 
    query += ' AND (title LIKE ? OR content LIKE ?)'; 
    const term = `%\${search}%`;
    params.push(term, term); 
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].count;
};

export const getById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT n.*, u.username as published_by_username 
    FROM notices n
    LEFT JOIN users u ON n.published_by = u.id
    WHERE n.id = ? AND n.is_deleted = 0
  `, [id]);
  return rows[0];
};

export const create = async (data) => {
  const { title, content, type, target_audience, is_active, expires_at, published_by } = data;
  const [result] = await pool.execute(
    'INSERT INTO notices (title, content, type, target_audience, is_active, expires_at, published_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, content, type, target_audience, is_active !== undefined ? is_active : 1, expires_at || null, published_by]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const { title, content, type, target_audience, is_active, expires_at } = data;
  await pool.execute(
    'UPDATE notices SET title = ?, content = ?, type = ?, target_audience = ?, is_active = ?, expires_at = ? WHERE id = ?',
    [title, content, type, target_audience, is_active, expires_at || null, id]
  );
};

export const softDelete = async (id) => {
  await pool.execute('UPDATE notices SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

export const getActiveNotices = async () => {
  const [rows] = await pool.execute(`
    SELECT n.*, u.username as published_by_username 
    FROM notices n
    LEFT JOIN users u ON n.published_by = u.id
    WHERE n.is_deleted = 0 AND n.is_active = 1 
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
    ORDER BY n.created_at DESC
  `);
  return rows;
};
