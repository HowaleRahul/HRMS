import pool from '../config/db.js';

export const getByUser = async (userId, filters) => {
  const { is_read, limit, offset } = filters;
  let query = 'SELECT * FROM notifications WHERE user_id = ? AND is_deleted = 0';
  const params = [userId];

  if (is_read !== undefined) {
    query += ' AND is_read = ?';
    params.push(is_read);
  }

  query += ' ORDER BY created_at DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ? AND is_deleted = 0', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { user_id, title, message, type, related_id, link } = data;
  const [result] = await pool.execute(
    'INSERT INTO notifications (user_id, title, message, type, related_id, link) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, title, message, type || 'info', related_id || null, link || null]
  );
  return result.insertId;
};

export const bulkCreate = async (notifications) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const insertedIds = [];
    for (const notif of notifications) {
      const { user_id, title, message, type, related_id, link } = notif;
      const [result] = await connection.execute(
        'INSERT INTO notifications (user_id, title, message, type, related_id, link) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, title, message, type || 'info', related_id || null, link || null]
      );
      insertedIds.push(result.insertId);
    }
    await connection.commit();
    return insertedIds;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const markAsRead = async (id, userId) => {
  await pool.execute(
    'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [id, userId]
  );
};

export const markAllAsRead = async (userId) => {
  await pool.execute(
    'UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0',
    [userId]
  );
};

export const getUnreadCount = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND is_deleted = 0',
    [userId]
  );
  return rows[0].count;
};

export const softDelete = async (id) => {
  await pool.execute('UPDATE notifications SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};
