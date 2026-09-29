import pool from '../config/db.js';

class DepartmentModel {
  async getAll(filters = {}) {
    const {
      search,
      is_active,
      page = 1,
      limit = 10,
      sortBy = 'departments.created_at',
      sortOrder = 'DESC'
    } = filters;

    let query = `
      SELECT 
        departments.*,
        parent.name as parent_department_name,
        CONCAT(head.first_name, ' ', head.last_name) as head_employee_name
      FROM departments
      LEFT JOIN departments as parent ON departments.parent_department_id = parent.id
      LEFT JOIN employees as head ON departments.head_employee_id = head.id
      WHERE departments.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (departments.name LIKE ? OR departments.code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (is_active !== undefined) {
      query += ` AND departments.is_active = ?`;
      params.push(is_active);
    }

    const allowedSorts = ['departments.name', 'departments.code', 'departments.created_at'];
    const finalSortBy = allowedSorts.includes(sortBy) ? sortBy : 'departments.created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

    if (limit > 0) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getCount(filters = {}) {
    const { search, is_active } = filters;
    let query = `SELECT COUNT(*) as total FROM departments WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        departments.*,
        parent.name as parent_department_name,
        CONCAT(head.first_name, ' ', head.last_name) as head_employee_name
      FROM departments
      LEFT JOIN departments as parent ON departments.parent_department_id = parent.id
      LEFT JOIN employees as head ON departments.head_employee_id = head.id
      WHERE departments.id = ? AND departments.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO departments (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE departments SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async softDelete(id) {
    const [result] = await pool.execute(`UPDATE departments SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  async getEmployeeCount(departmentId) {
    const [rows] = await pool.execute(`SELECT COUNT(*) as total FROM employees WHERE department_id = ? AND is_deleted = 0 AND is_active = 1`, [departmentId]);
    return rows[0].total;
  }
}

export default new DepartmentModel();
