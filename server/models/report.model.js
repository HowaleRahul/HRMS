import pool from '../config/db.js';

export const getEmployeeReport = async (filters) => {
  const { department_id, designation_id, is_active, joining_date_from, joining_date_to } = filters;
  let query = `
    SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone, e.joining_date, e.is_active,
           d.name as department, des.title as designation
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations des ON e.designation_id = des.id
    WHERE e.is_deleted = 0
  `;
  const params = [];

  if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
  if (designation_id) { query += ' AND e.designation_id = ?'; params.push(designation_id); }
  if (is_active !== undefined) { query += ' AND e.is_active = ?'; params.push(is_active); }
  if (joining_date_from) { query += ' AND e.joining_date >= ?'; params.push(joining_date_from); }
  if (joining_date_to) { query += ' AND e.joining_date <= ?'; params.push(joining_date_to); }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getAttendanceReport = async (filters) => {
  const { employee_id, department_id, date_from, date_to } = filters;
  let query = `
    SELECT a.date, a.check_in, a.check_out, a.status, a.work_hours,
           e.employee_code, e.first_name, e.last_name, d.name as department
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE a.is_deleted = 0
  `;
  const params = [];

  if (employee_id) { query += ' AND a.employee_id = ?'; params.push(employee_id); }
  if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
  if (date_from) { query += ' AND a.date >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND a.date <= ?'; params.push(date_to); }

  query += ' ORDER BY a.date DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getLeaveReport = async (filters) => {
  const { employee_id, department_id, leave_type_id, status, date_from, date_to } = filters;
  let query = `
    SELECT lr.start_date, lr.end_date, lr.total_days, lr.status, lr.reason,
           e.employee_code, e.first_name, e.last_name, lt.name as leave_type, d.name as department
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE lr.is_deleted = 0
  `;
  const params = [];

  if (employee_id) { query += ' AND lr.employee_id = ?'; params.push(employee_id); }
  if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
  if (leave_type_id) { query += ' AND lr.leave_type_id = ?'; params.push(leave_type_id); }
  if (status) { query += ' AND lr.status = ?'; params.push(status); }
  if (date_from) { query += ' AND lr.start_date >= ?'; params.push(date_from); }
  if (date_to) { query += ' AND lr.end_date <= ?'; params.push(date_to); }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getPayrollReport = async (filters) => {
  const { employee_id, department_id, month, year, payment_status } = filters;
  let query = `
    SELECT p.month, p.year, p.basic_salary, p.net_salary, p.payment_status, p.payment_date,
           e.employee_code, e.first_name, e.last_name, d.name as department
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE p.is_deleted = 0
  `;
  const params = [];

  if (employee_id) { query += ' AND p.employee_id = ?'; params.push(employee_id); }
  if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
  if (month) { query += ' AND p.month = ?'; params.push(month); }
  if (year) { query += ' AND p.year = ?'; params.push(year); }
  if (payment_status) { query += ' AND p.payment_status = ?'; params.push(payment_status); }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getDepartmentReport = async () => {
  const [rows] = await pool.execute(`
    SELECT d.name, COUNT(e.id) as total_employees, SUM(CASE WHEN e.is_active = 1 THEN 1 ELSE 0 END) as active_employees
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id AND e.is_deleted = 0
    WHERE d.is_deleted = 0
    GROUP BY d.id
  `);
  return rows;
};

export const getJoiningExitReport = async (filters) => {
  const { date_from, date_to } = filters;
  let query = `
    SELECT employee_code, first_name, last_name, joining_date, last_working_date as exit_date, is_active 
    FROM employees 
    WHERE is_deleted = 0 AND ((joining_date BETWEEN ? AND ?) OR (last_working_date BETWEEN ? AND ?))
  `;
  const [rows] = await pool.execute(query, [date_from, date_to, date_from, date_to]);
  return rows;
};
