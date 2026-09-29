import pool from '../config/db.js';

export const getAll = async (filters) => {
  const { year, type, limit, offset } = filters;
  let query = 'SELECT * FROM holidays WHERE is_deleted = 0';
  const params = [];

  if (year) { 
    query += ' AND YEAR(date) = ?'; 
    params.push(year); 
  }
  if (type) { 
    query += ' AND type = ?'; 
    params.push(type); 
  }

  query += ' ORDER BY date ASC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getCount = async (filters) => {
  const { year, type } = filters;
  let query = 'SELECT COUNT(*) as count FROM holidays WHERE is_deleted = 0';
  const params = [];

  if (year) { query += ' AND YEAR(date) = ?'; params.push(year); }
  if (type) { query += ' AND type = ?'; params.push(type); }

  const [rows] = await pool.execute(query, params);
  return rows[0].count;
};

export const getById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM holidays WHERE id = ? AND is_deleted = 0', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { name, date, type, description } = data;
  const [result] = await pool.execute(
    'INSERT INTO holidays (name, date, type, description) VALUES (?, ?, ?, ?)',
    [name, date, type, description || null]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const { name, date, type, description } = data;
  await pool.execute(
    'UPDATE holidays SET name = ?, date = ?, type = ?, description = ? WHERE id = ?',
    [name, date, type, description || null, id]
  );
};

export const softDelete = async (id) => {
  await pool.execute('UPDATE holidays SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

export const getByYear = async (year) => {
  const [rows] = await pool.execute(
    'SELECT * FROM holidays WHERE YEAR(date) = ? AND is_deleted = 0 ORDER BY date ASC',
    [year]
  );
  return rows;
};

export const getUpcoming = async (limit = 5) => {
  const [rows] = await pool.execute(
    'SELECT * FROM holidays WHERE date >= CURDATE() AND is_deleted = 0 ORDER BY date ASC LIMIT ?',
    [Number(limit)]
  );
  return rows;
};
