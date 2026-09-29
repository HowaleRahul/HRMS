import pool from '../config/db.js';

class AttendanceModel {
  async getAll(filters = {}) {
    const { employee_id, department_id, date, date_from, date_to, status, page = 1, limit = 10 } = filters;
    let query = `
      SELECT 
        attendance.*,
        CONCAT(employees.first_name, ' ', employees.last_name) as employee_name,
        employees.employee_code,
        departments.name as department_name
      FROM attendance
      JOIN employees ON attendance.employee_id = employees.id
      LEFT JOIN departments ON employees.department_id = departments.id
      WHERE attendance.is_deleted = 0
    `;
    const params = [];

    if (employee_id) { query += ` AND attendance.employee_id = ?`; params.push(employee_id); }
    if (department_id) { query += ` AND employees.department_id = ?`; params.push(department_id); }
    if (date) { query += ` AND attendance.date = ?`; params.push(date); }
    if (date_from) { query += ` AND attendance.date >= ?`; params.push(date_from); }
    if (date_to) { query += ` AND attendance.date <= ?`; params.push(date_to); }
    if (status) { query += ` AND attendance.status = ?`; params.push(status); }

    query += ` ORDER BY attendance.date DESC, employees.first_name ASC`;

    if (limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number((page - 1) * limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getCount(filters = {}) {
    const { employee_id, department_id, date, date_from, date_to, status } = filters;
    let query = `
      SELECT COUNT(*) as total 
      FROM attendance 
      JOIN employees ON attendance.employee_id = employees.id
      WHERE attendance.is_deleted = 0
    `;
    const params = [];

    if (employee_id) { query += ` AND attendance.employee_id = ?`; params.push(employee_id); }
    if (department_id) { query += ` AND employees.department_id = ?`; params.push(department_id); }
    if (date) { query += ` AND attendance.date = ?`; params.push(date); }
    if (date_from) { query += ` AND attendance.date >= ?`; params.push(date_from); }
    if (date_to) { query += ` AND attendance.date <= ?`; params.push(date_to); }
    if (status) { query += ` AND attendance.status = ?`; params.push(status); }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getById(id) {
    const [rows] = await pool.execute(`
      SELECT attendance.*, CONCAT(employees.first_name, ' ', employees.last_name) as employee_name
      FROM attendance
      JOIN employees ON attendance.employee_id = employees.id
      WHERE attendance.id = ? AND attendance.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async getByEmployeeAndDate(employeeId, date) {
    const [rows] = await pool.execute(`
      SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND is_deleted = 0
    `, [employeeId, date]);
    return rows[0];
  }

  async checkIn(data) {
    const { employee_id, date, check_in, status, late_minutes } = data;
    const existing = await this.getByEmployeeAndDate(employee_id, date);

    if (existing) {
      const [result] = await pool.execute(`
        UPDATE attendance SET check_in = ?, status = ?, late_minutes = ? WHERE id = ?
      `, [check_in, status, late_minutes, existing.id]);
      return existing.id;
    } else {
      const [result] = await pool.execute(`
        INSERT INTO attendance (employee_id, date, check_in, status, late_minutes) 
        VALUES (?, ?, ?, ?, ?)
      `, [employee_id, date, check_in, status, late_minutes]);
      return result.insertId;
    }
  }

  async checkOut(id, data) {
    const { check_out, work_hours, overtime_hours, early_leaving_minutes } = data;
    const [result] = await pool.execute(`
      UPDATE attendance 
      SET check_out = ?, work_hours = ?, overtime_hours = ?, early_leaving_minutes = ?
      WHERE id = ?
    `, [check_out, work_hours, overtime_hours, early_leaving_minutes, id]);
    return result.affectedRows;
  }

  async markAttendance(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO attendance (${fields.join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE status = VALUES(status), check_in = VALUES(check_in), check_out = VALUES(check_out), remarks = VALUES(remarks)`, values);
    return result.insertId || result.affectedRows;
  }

  async bulkMarkAttendance(records) {
    for (const record of records) {
      const { employee_id, date, status, remarks } = record;
      await pool.execute(`
        INSERT INTO attendance (employee_id, date, status, remarks)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)
      `, [employee_id, date, status, remarks || null]);
    }
    return records.length;
  }

  async getMonthlyReport(employeeId, month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const [rows] = await pool.execute(`
      SELECT * FROM attendance 
      WHERE employee_id = ? AND date BETWEEN ? AND ? AND is_deleted = 0
      ORDER BY date ASC
    `, [employeeId, startDate, endDate]);
    return rows;
  }

  async getDepartmentReport(departmentId, date) {
    const [rows] = await pool.execute(`
      SELECT attendance.*, CONCAT(employees.first_name, ' ', employees.last_name) as employee_name 
      FROM attendance
      JOIN employees ON attendance.employee_id = employees.id
      WHERE employees.department_id = ? AND attendance.date = ? AND attendance.is_deleted = 0
    `, [departmentId, date]);
    return rows;
  }

  async getAttendanceSettings() {
    const [rows] = await pool.execute(`SELECT * FROM attendance_settings ORDER BY id DESC LIMIT 1`);
    return rows[0];
  }

  async updateAttendanceSettings(data) {
    const [existing] = await pool.execute(`SELECT id FROM attendance_settings LIMIT 1`);
    if (existing.length) {
      const fields = Object.keys(data);
      const updates = fields.map(f => `${f} = ?`).join(', ');
      const values = Object.values(data);
      values.push(existing[0].id);
      await pool.execute(`UPDATE attendance_settings SET ${updates} WHERE id = ?`, values);
    } else {
      const fields = Object.keys(data);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(data);
      await pool.execute(`INSERT INTO attendance_settings (${fields.join(', ')}) VALUES (${placeholders})`, values);
    }
  }

  async getTodayStats() {
    const date = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
      FROM attendance
      WHERE date = ? AND is_deleted = 0
    `, [date]);
    return rows[0];
  }
}

export default new AttendanceModel();
