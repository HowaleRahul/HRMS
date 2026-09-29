import pool from '../config/db.js';

export const getAll = async (filters) => {
  const { employee_id, department_id, month, year, payment_status, limit, offset } = filters;
  let query = `
    SELECT p.*, e.first_name, e.last_name, e.employee_code, d.name as department_name
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

  query += ' ORDER BY p.year DESC, p.month DESC';
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset || 0));
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getCount = async (filters) => {
  const { employee_id, department_id, month, year, payment_status } = filters;
  let query = `
    SELECT COUNT(*) as count 
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    WHERE p.is_deleted = 0
  `;
  const params = [];

  if (employee_id) { query += ' AND p.employee_id = ?'; params.push(employee_id); }
  if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
  if (month) { query += ' AND p.month = ?'; params.push(month); }
  if (year) { query += ' AND p.year = ?'; params.push(year); }
  if (payment_status) { query += ' AND p.payment_status = ?'; params.push(payment_status); }

  const [rows] = await pool.execute(query, params);
  return rows[0].count;
};

export const getById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT p.*, e.first_name, e.last_name, e.employee_code, d.name as department_name, des.name as designation_name
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations des ON e.designation_id = des.id
    WHERE p.id = ? AND p.is_deleted = 0
  `, [id]);
  return rows[0];
};

export const getByEmployeeMonthYear = async (employeeId, month, year) => {
  const [rows] = await pool.execute(
    'SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ? AND is_deleted = 0',
    [employeeId, month, year]
  );
  return rows[0];
};

export const generate = async (data) => {
  const { employee_id, month, year, basic_salary, allowances, deductions, net_salary } = data;
  const [result] = await pool.execute(
    'INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")',
    [employee_id, month, year, basic_salary, JSON.stringify(allowances || {}), JSON.stringify(deductions || {}), net_salary]
  );
  return result.insertId;
};

export const bulkGenerate = async (records) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const insertedIds = [];
    for (const data of records) {
      const { employee_id, month, year, basic_salary, allowances, deductions, net_salary } = data;
      const [result] = await connection.execute(
        'INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")',
        [employee_id, month, year, basic_salary, JSON.stringify(allowances || {}), JSON.stringify(deductions || {}), net_salary]
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

export const update = async (id, data) => {
  const { basic_salary, hra, da, transport_allowance, medical_allowance, special_allowance, overtime_pay, bonus, gross_earnings, pf_employee, pf_employer, professional_tax, tds, esi, other_deductions, total_deductions, net_salary } = data;
  await pool.execute(
    'UPDATE payroll SET basic_salary=?, hra=?, da=?, transport_allowance=?, medical_allowance=?, special_allowance=?, overtime_pay=?, bonus=?, gross_earnings=?, pf_employee=?, pf_employer=?, professional_tax=?, tds=?, esi=?, other_deductions=?, total_deductions=?, net_salary=? WHERE id=?',
    [basic_salary||0, hra||0, da||0, transport_allowance||0, medical_allowance||0, special_allowance||0, overtime_pay||0, bonus||0, gross_earnings||0, pf_employee||0, pf_employer||0, professional_tax||0, tds||0, esi||0, other_deductions||0, total_deductions||0, net_salary||0, id]
  );
};

export const updatePaymentStatus = async (id, status, paymentDate, transactionRef) => {
  await pool.execute(
    'UPDATE payroll SET payment_status = ?, payment_date = ?, transaction_ref = ? WHERE id = ?',
    [status, paymentDate, transactionRef, id]
  );
};

export const softDelete = async (id) => {
  await pool.execute('UPDATE payroll SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
};

export const getMonthlyPayrollSummary = async (month, year) => {
  const [rows] = await pool.execute(`
    SELECT 
      COUNT(*) as total_employees,
      SUM(basic_salary) as total_basic,
      SUM(net_salary) as total_net
    FROM payroll 
    WHERE month = ? AND year = ? AND is_deleted = 0
  `, [month, year]);
  return rows[0];
};

export const generateFromSalaryStructure = async (employeeId, month, year) => {
  const [rows] = await pool.execute(`
    SELECT basic_salary, hra, da, transport_allowance, medical_allowance, special_allowance, pf_employee, pf_employer, professional_tax, tds, esi, other_deductions 
    FROM salary_structures 
    WHERE employee_id = ? AND is_deleted = 0 AND is_active = 1
  `, [employeeId]);
  
  if (rows.length === 0) return null;
  const struct = rows[0];
  
      const net_salary = Number(struct.basic_salary) + Number(struct.hra) + Number(struct.da) + Number(struct.transport_allowance) + Number(struct.medical_allowance) + Number(struct.special_allowance) - Number(struct.pf_employee) - Number(struct.professional_tax) - Number(struct.tds) - Number(struct.esi) - Number(struct.other_deductions);
  
  return generate({
    employee_id: employeeId,
    month,
    year,
    basic_salary: struct.basic_salary,
    hra: struct.hra,
    da: struct.da,
    transport_allowance: struct.transport_allowance,
    medical_allowance: struct.medical_allowance,
    special_allowance: struct.special_allowance,
    pf_employee: struct.pf_employee,
    pf_employer: struct.pf_employer,
    professional_tax: struct.professional_tax,
    tds: struct.tds,
    esi: struct.esi,
    other_deductions: struct.other_deductions,
    net_salary
  });
};
