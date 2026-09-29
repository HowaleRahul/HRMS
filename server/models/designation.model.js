import pool from '../config/db.js';

class DesignationModel {
  async getAll(filters = {}) {
    const { search, department_id, is_active, page = 1, limit = 10 } = filters;
    let query = `
      SELECT designations.*, departments.name as department_name
      FROM designations
      LEFT JOIN departments ON designations.department_id = departments.id
      WHERE designations.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (designations.title LIKE ?)`;
      params.push(`%${search}%`);
    }
    if (department_id) {
      query += ` AND designations.department_id = ?`;
      params.push(department_id);
    }
    if (is_active !== undefined) {
      query += ` AND designations.is_active = ?`;
      params.push(is_active);
    }

    query += ` ORDER BY designations.created_at DESC`;

    if (limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number((page - 1) * limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getCount(filters = {}) {
    const { search, department_id, is_active } = filters;
    let query = `SELECT COUNT(*) as total FROM designations WHERE is_deleted = 0`;
    const params = [];
    if (search) { query += ` AND title LIKE ?`; params.push(`%${search}%`); }
    if (department_id) { query += ` AND department_id = ?`; params.push(department_id); }
    if (is_active !== undefined) { query += ` AND is_active = ?`; params.push(is_active); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getById(id) {
    const [rows] = await pool.execute(`
      SELECT designations.*, departments.name as department_name
      FROM designations
      LEFT JOIN departments ON designations.department_id = departments.id
      WHERE designations.id = ? AND designations.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO designations (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE designations SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async softDelete(id) {
    const [result] = await pool.execute(`UPDATE designations SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  async getEmployeeCount(designationId) {
    const [rows] = await pool.execute(`SELECT COUNT(*) as total FROM employees WHERE designation_id = ? AND is_deleted = 0 AND is_active = 1`, [designationId]);
    return rows[0].total;
  }
}

export default new DesignationModel();
