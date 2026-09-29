import pool from '../config/db.js';

class DocumentModel {
  async getAll(filters = {}) {
    const { employee_id, document_type_id, page = 1, limit = 10 } = filters;
    let query = `
      SELECT d.*, m.name as document_type_name, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             u.username as verified_by_username
      FROM documents d
      JOIN master_document_type m ON d.document_type_id = m.id
      JOIN employees e ON d.employee_id = e.id
      LEFT JOIN users u ON d.verified_by = u.id
      WHERE d.is_deleted = 0
    `;
    const params = [];

    if (employee_id) { query += ` AND d.employee_id = ?`; params.push(employee_id); }
    if (document_type_id) { query += ` AND d.document_type_id = ?`; params.push(document_type_id); }
    query += ` ORDER BY d.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getCount(filters = {}) {
    const { employee_id, document_type_id } = filters;
    let query = `SELECT COUNT(*) as total FROM documents d WHERE d.is_deleted = 0`;
    const params = [];
    if (employee_id) { query += ` AND d.employee_id = ?`; params.push(employee_id); }
    if (document_type_id) { query += ` AND d.document_type_id = ?`; params.push(document_type_id); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getById(id) {
    const [rows] = await pool.execute(`
      SELECT d.*, m.name as document_type_name, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name
      FROM documents d
      JOIN master_document_type m ON d.document_type_id = m.id
      JOIN employees e ON d.employee_id = e.id
      WHERE d.id = ? AND d.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async getByEmployee(employeeId) {
    const [rows] = await pool.execute(`
      SELECT d.*, m.name as document_type_name 
      FROM documents d
      JOIN master_document_type m ON d.document_type_id = m.id
      WHERE d.employee_id = ? AND d.is_deleted = 0
      ORDER BY d.created_at DESC
    `, [employeeId]);
    return rows;
  }

  async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO documents (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE documents SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async softDelete(id) {
    const [result] = await pool.execute(`UPDATE documents SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  async verify(id, verifiedBy) {
    const [result] = await pool.execute(`UPDATE documents SET verified_by = ?, verified_at = NOW() WHERE id = ?`, [verifiedBy, id]);
    return result.affectedRows;
  }
}

export default new DocumentModel();
