import pool from '../config/db.js';

export const getTotalEmployees = async () => {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM employees WHERE is_active = 1 AND is_deleted = 0');
  return rows[0].count;
};

export const getPresentToday = async () => {
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status IN ('present', 'late') AND is_deleted = 0");
  return rows[0].count;
};

export const getAbsentToday = async () => {
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'absent' AND is_deleted = 0");
  return rows[0].count;
};

export const getOnLeaveToday = async () => {
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'approved' AND CURDATE() BETWEEN start_date AND end_date AND is_deleted = 0");
  return rows[0].count;
};

export const getLateToday = async () => {
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'late' AND is_deleted = 0");
  return rows[0].count;
};

export const getNewEmployees = async (days = 30) => {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM employees WHERE joining_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND is_active = 1 AND is_deleted = 0', [days]);
  return rows[0].count;
};

export const getDepartmentWiseCount = async () => {
  const [rows] = await pool.execute(`
    SELECT d.name, COUNT(e.id) as count 
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id AND e.is_active = 1 AND e.is_deleted = 0
    WHERE d.is_deleted = 0
    GROUP BY d.id, d.name
  `);
  return rows;
};

export const getRecentActivities = async (limit = 10) => {
  const [rows] = await pool.execute(`
    SELECT a.*, u.username 
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT ?
  `, [Number(limit)]);
  return rows;
};

export const getUpcomingHolidays = async (limit = 5) => {
  const [rows] = await pool.execute('SELECT * FROM holidays WHERE date >= CURDATE() AND is_deleted = 0 ORDER BY date ASC LIMIT ?', [Number(limit)]);
  return rows;
};

export const getPendingLeaveRequests = async () => {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending" AND is_deleted = 0');
  return rows[0].count;
};

export const getMonthlyAttendanceSummary = async (month, year) => {
  const [rows] = await pool.execute(`
    SELECT status, COUNT(*) as count 
    FROM attendance 
    WHERE MONTH(date) = ? AND YEAR(date) = ? AND is_deleted = 0
    GROUP BY status
  `, [month, year]);
  return rows;
};

export const getPayrollSummary = async (month, year) => {
  const [rows] = await pool.execute(`
    SELECT SUM(basic_salary) as total_basic, SUM(net_salary) as total_net, COUNT(*) as processed_count
    FROM payroll
    WHERE month = ? AND year = ? AND is_deleted = 0
  `, [month, year]);
  return rows[0];
};

export const getRecruitmentStats = async () => {
  const [rows] = await pool.execute(`
    SELECT status, COUNT(*) as count 
    FROM job_applications 
    WHERE is_deleted = 0
    GROUP BY status
  `);
  return rows;
};
