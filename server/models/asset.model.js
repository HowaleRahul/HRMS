import pool from '../config/db.js';

class AssetModel {
  async getAll(filters = {}) {
    const { search, asset_type_id, status, condition, page = 1, limit = 10 } = filters;
    let query = `
      SELECT a.*, m.name as asset_type_name
      FROM assets a
      JOIN master_asset_type m ON a.asset_type_id = m.id
      WHERE a.is_deleted = 0
    `;
    const params = [];
    if (search) { query += ` AND (a.name LIKE ? OR a.asset_code LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (asset_type_id) { query += ` AND a.asset_type_id = ?`; params.push(asset_type_id); }
    if (status) { query += ` AND a.status = ?`; params.push(status); }
    if (condition) { query += ` AND a.condition = ?`; params.push(condition); }
    query += ` ORDER BY a.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getCount(filters = {}) {
    const { search, asset_type_id, status, condition } = filters;
    let query = `SELECT COUNT(*) as total FROM assets a WHERE a.is_deleted = 0`;
    const params = [];
    if (search) { query += ` AND (a.name LIKE ? OR a.asset_code LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (asset_type_id) { query += ` AND a.asset_type_id = ?`; params.push(asset_type_id); }
    if (status) { query += ` AND a.status = ?`; params.push(status); }
    if (condition) { query += ` AND a.condition = ?`; params.push(condition); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getById(id) {
    const [rows] = await pool.execute(`
      SELECT a.*, m.name as asset_type_name
      FROM assets a
      JOIN master_asset_type m ON a.asset_type_id = m.id
      WHERE a.id = ? AND a.is_deleted = 0
    `, [id]);
    if (!rows[0]) return null;
    
    const [assignments] = await pool.execute(`
      SELECT asg.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name
      FROM asset_assignments asg
      JOIN employees e ON asg.employee_id = e.id
      WHERE asg.asset_id = ? AND asg.is_deleted = 0 AND asg.status = 'active'
    `, [id]);
    
    return { ...rows[0], current_assignment: assignments[0] || null };
  }

  async getLastAssetCode() {
    const [rows] = await pool.execute(`
      SELECT asset_code FROM assets WHERE asset_code LIKE 'AST%' ORDER BY CAST(SUBSTRING(asset_code, 4) AS UNSIGNED) DESC LIMIT 1
    `);
    return rows.length ? rows[0].asset_code : null;
  }

  async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO assets (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE assets SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async softDelete(id) {
    const [result] = await pool.execute(`UPDATE assets SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  // Assignments
  async getAssignments(filters = {}) {
    const { asset_id, employee_id, status, page = 1, limit = 10 } = filters;
    let query = `
      SELECT asg.*, a.name as asset_name, a.asset_code,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             u.username as assigned_by_username
      FROM asset_assignments asg
      JOIN assets a ON asg.asset_id = a.id
      JOIN employees e ON asg.employee_id = e.id
      LEFT JOIN users u ON asg.assigned_by = u.id
      WHERE asg.is_deleted = 0
    `;
    const params = [];
    if (asset_id) { query += ` AND asg.asset_id = ?`; params.push(asset_id); }
    if (employee_id) { query += ` AND asg.employee_id = ?`; params.push(employee_id); }
    if (status) { query += ` AND asg.status = ?`; params.push(status); }
    query += ` ORDER BY asg.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getAssignmentCount(filters = {}) {
    const { asset_id, employee_id, status } = filters;
    let query = `SELECT COUNT(*) as total FROM asset_assignments asg WHERE asg.is_deleted = 0`;
    const params = [];
    if (asset_id) { query += ` AND asg.asset_id = ?`; params.push(asset_id); }
    if (employee_id) { query += ` AND asg.employee_id = ?`; params.push(employee_id); }
    if (status) { query += ` AND asg.status = ?`; params.push(status); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getAssignmentById(id) {
    const [rows] = await pool.execute(`SELECT * FROM asset_assignments WHERE id = ? AND is_deleted = 0`, [id]);
    return rows[0];
  }

  async assignAsset(data) {
    const { asset_id, employee_id, assigned_date, assigned_by, condition_on_assign } = data;
    const [result] = await pool.execute(`
      INSERT INTO asset_assignments (asset_id, employee_id, assigned_date, assigned_by, condition_on_assign) 
      VALUES (?, ?, ?, ?, ?)
    `, [asset_id, employee_id, assigned_date, assigned_by, condition_on_assign]);
    
    await pool.execute(`UPDATE assets SET status = 'assigned' WHERE id = ?`, [asset_id]);
    return result.insertId;
  }

  async returnAsset(assignmentId, data) {
    const { returned_date, condition_on_return, remarks, asset_id } = data;
    await pool.execute(`
      UPDATE asset_assignments 
      SET returned_date = ?, condition_on_return = ?, remarks = ?, status = 'returned' 
      WHERE id = ?
    `, [returned_date, condition_on_return, remarks, assignmentId]);
    
    const newStatus = condition_on_return === 'damaged' ? 'in_repair' : 'available';
    await pool.execute(`UPDATE assets SET status = ?, \`condition\` = ? WHERE id = ?`, [newStatus, condition_on_return, asset_id]);
  }

  async getAssignmentsByEmployee(employeeId) {
    return this.getAssignments({ employee_id: employeeId, limit: 0 });
  }
}

export default new AssetModel();
