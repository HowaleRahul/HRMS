import pool from '../config/db.js';

export const getLeaveTypes = async () => {
  const [rows] = await pool.execute('SELECT * FROM leave_types WHERE is_deleted = 0 AND is_active = 1');
  return rows;
};

export const getLeaveTypeById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM leave_types WHERE id = ? AND is_deleted = 0', [id]);
  return rows[0];
};

export const createLeaveType = async (data) => {
  const { name, description, default_days, is_paid } = data;
  const [result] = await pool.execute(
    'INSERT INTO leave_types (name, description, default_days, is_paid) VALUES (?, ?, ?, ?)',
    [name, description, default_days, is_paid]
  );
  return result.insertId;
};

export const updateLeaveType = async (id, data) => {
  const { name, description, default_days, is_paid, is_active } = data;
  await pool.execute(
    'UPDATE leave_types SET name = ?, description = ?, default_days = ?, is_paid = ?, is_active = ? WHERE id = ?',
    [name, description, default_days, is_paid, is_active, id]
  );
};

export const deleteLeaveType = async (id) => {
  await pool.execute('UPDATE leave_types SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

export const getLeaveBalances = async (employeeId, year) => {
  const [rows] = await pool.execute(`
        SELECT lb.*, lb.total_days AS total, lb.used_days AS used,
          (lb.total_days - lb.used_days) AS remaining,
          lt.name as leave_type_name, lt.is_paid
    FROM leave_balances lb
    JOIN leave_types lt ON lb.leave_type_id = lt.id
    WHERE lb.employee_id = ? AND lb.year = ? AND lb.is_deleted = 0
  `, [employeeId, year]);
  return rows;
};

export const initializeLeaveBalances = async (employeeId, year) => {
  const leaveTypes = await getLeaveTypes();
  for (const type of leaveTypes) {
    await pool.execute(
      'INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days) VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE total_days = ?',
      [employeeId, type.id, year, type.default_days, type.default_days]
    );
  }
};

export const updateLeaveBalance = async (id, usedDays) => {
  await pool.execute('UPDATE leave_balances SET used_days = ? WHERE id = ?', [usedDays, id]);
};

export const getLeaveRequests = async (filters) => {
  const { employee_id, leave_type_id, status, date_from, date_to, limit, offset } = filters;
  let query = `
    SELECT lr.*, e.first_name, e.last_name, lt.name as leave_type_name, a.first_name as approver_first_name, a.last_name as approver_last_name
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    LEFT JOIN employees a ON lr.approved_by = a.id
    WHERE lr.is_deleted = 0
  `;
  const params = [];

  if (employee_id) { query += ' AND lr.employee_id = ?'; params.push(employee_id); }
  if (leave_type_id) { query += ' AND lr.leave_type_id = ?'; params.push(leave_type_id); }
  if (status) { query += ' AND lr.status = ?'; params.push(status); }
  if (date_from) { query += ' AND lr.start_date >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND lr.end_date <= ?'; params.push(date_to); }

  query += ' ORDER BY lr.created_at DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getLeaveRequestCount = async (filters) => {
  const { employee_id, leave_type_id, status, date_from, date_to } = filters;
  let query = 'SELECT COUNT(*) as count FROM leave_requests WHERE is_deleted = 0';
  const params = [];

  if (employee_id) { query += ' AND employee_id = ?'; params.push(employee_id); }
  if (leave_type_id) { query += ' AND leave_type_id = ?'; params.push(leave_type_id); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (date_from) { query += ' AND start_date >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND end_date <= ?'; params.push(date_to); }

  const [rows] = await pool.execute(query, params);
  return rows[0].count;
};

export const getLeaveRequestById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT lr.*, e.first_name, e.last_name, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.id = ? AND lr.is_deleted = 0
  `, [id]);
  return rows[0];
};

export const createLeaveRequest = async (data) => {
  const { employee_id, leave_type_id, start_date, end_date, total_days, reason } = data;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [employees] = await connection.execute(
      'SELECT id FROM employees WHERE id = ? AND is_deleted = 0 FOR UPDATE',
      [employee_id]
    );
    if (employees.length === 0) throw Object.assign(new Error('Employee not found'), { code: 'EMPLOYEE_NOT_FOUND' });

    const year = new Date(`${start_date}T00:00:00Z`).getUTCFullYear();
    const [balances] = await connection.execute(`
      SELECT total_days, used_days FROM leave_balances
      WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND is_deleted = 0
      FOR UPDATE
    `, [employee_id, leave_type_id, year]);
    if (balances.length === 0) throw Object.assign(new Error('No leave balance exists for this leave type'), { code: 'NO_LEAVE_BALANCE' });

    const [overlaps] = await connection.execute(`
      SELECT id FROM leave_requests
      WHERE employee_id = ? AND status IN ('pending', 'approved') AND is_deleted = 0
        AND start_date <= ? AND end_date >= ?
      LIMIT 1
    `, [employee_id, end_date, start_date]);
    if (overlaps.length > 0) throw Object.assign(new Error('Leave request overlaps an existing request'), { code: 'LEAVE_OVERLAP' });

    const [requested] = await connection.execute(`
      SELECT COALESCE(SUM(total_days), 0) AS pending_days FROM leave_requests
      WHERE employee_id = ? AND leave_type_id = ? AND YEAR(start_date) = ?
        AND status = 'pending' AND is_deleted = 0
    `, [employee_id, leave_type_id, year]);
    const availableDays = Number(balances[0].total_days) - Number(balances[0].used_days) - Number(requested[0].pending_days);
    if (availableDays < Number(total_days)) throw Object.assign(new Error('Insufficient leave balance'), { code: 'INSUFFICIENT_BALANCE' });

    const [result] = await connection.execute(
      'INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status) VALUES (?, ?, ?, ?, ?, ?, "pending")',
      [employee_id, leave_type_id, start_date, end_date, total_days, reason]
    );
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateLeaveRequestStatus = async (id, status, approvedBy, rejectionReason = null) => {
  await pool.execute(
    'UPDATE leave_requests SET status = ?, approved_by = ?, approved_on = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?',
    [status, approvedBy, rejectionReason, id]
  );
};

export const cancelLeaveRequest = async (id) => {
  await pool.execute('UPDATE leave_requests SET status = "cancelled" WHERE id = ?', [id]);
};

export const checkOverlap = async (employeeId, startDate, endDate) => {
  const [rows] = await pool.execute(`
    SELECT id FROM leave_requests 
    WHERE employee_id = ? 
    AND status IN ('pending', 'approved')
    AND is_deleted = 0
    AND (
      (start_date <= ? AND end_date >= ?) OR
      (start_date <= ? AND end_date >= ?) OR
      (start_date >= ? AND end_date <= ?)
    )
  `, [employeeId, endDate, startDate, startDate, startDate, startDate, endDate]);
  return rows.length > 0;
};

export const getPendingLeaveCount = async () => {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending" AND is_deleted = 0');
  return rows[0].count;
};

export const getTeamLeaveRequests = async (managerId, filters) => {
  const { status, limit, offset } = filters;
  let query = `
    SELECT lr.*, e.first_name, e.last_name, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE e.reporting_manager_id = ? AND lr.is_deleted = 0
  `;
  const params = [managerId];

  if (status) { query += ' AND lr.status = ?'; params.push(status); }
  
  query += ' ORDER BY lr.created_at DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};
