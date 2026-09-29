import pool from '../config/db.js';

const employeeCreateFields = new Set([
  'employee_code', 'first_name', 'last_name', 'email', 'phone', 'alternate_phone', 'date_of_birth',
  'gender_id', 'blood_group_id', 'marital_status_id', 'nationality', 'photo', 'current_address',
  'permanent_address', 'department_id', 'designation_id', 'reporting_manager_id', 'employment_type_id',
  'joining_date', 'confirmation_date', 'resignation_date', 'last_working_date', 'is_active'
]);
const employeeUpdateFields = new Set([...employeeCreateFields].filter(field => field !== 'employee_code'));

class EmployeeModel {
  async getAll(filters = {}) {
    const {
      search,
      department_id,
      designation_id,
      employment_type_id,
      is_active,
      page = 1,
      limit = 10,
      sortBy = 'employees.created_at',
      sortOrder = 'DESC'
    } = filters;

    let query = `
      SELECT 
        employees.*,
        departments.name as department_name,
        designations.title as designation_title,
        master_gender.name as gender_name,
        master_employment_type.name as employment_type_name,
        CONCAT(manager.first_name, ' ', manager.last_name) as reporting_manager_name
      FROM employees
      LEFT JOIN departments ON employees.department_id = departments.id
      LEFT JOIN designations ON employees.designation_id = designations.id
      LEFT JOIN master_gender ON employees.gender_id = master_gender.id
      LEFT JOIN master_employment_type ON employees.employment_type_id = master_employment_type.id
      LEFT JOIN employees as manager ON employees.reporting_manager_id = manager.id
      WHERE employees.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (employees.first_name LIKE ? OR employees.last_name LIKE ? OR employees.email LIKE ? OR employees.employee_code LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (department_id) {
      query += ` AND employees.department_id = ?`;
      params.push(department_id);
    }

    if (designation_id) {
      query += ` AND employees.designation_id = ?`;
      params.push(designation_id);
    }

    if (employment_type_id) {
      query += ` AND employees.employment_type_id = ?`;
      params.push(employment_type_id);
    }

    if (is_active !== undefined) {
      query += ` AND employees.is_active = ?`;
      params.push(is_active);
    }

    // Protect against SQL injection by allowing only specific columns to be sorted
    const allowedSortColumns = ['employees.created_at', 'employees.first_name', 'employees.employee_code', 'departments.name', 'designations.title'];
    const finalSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'employees.created_at';
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
    const { search, department_id, designation_id, employment_type_id, is_active } = filters;
    let query = `SELECT COUNT(*) as total FROM employees WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (department_id) {
      query += ` AND department_id = ?`;
      params.push(department_id);
    }

    if (designation_id) {
      query += ` AND designation_id = ?`;
      params.push(designation_id);
    }

    if (employment_type_id) {
      query += ` AND employment_type_id = ?`;
      params.push(employment_type_id);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getTotalCount() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM employees WHERE is_deleted = 0 AND is_active = 1');
    return rows[0].total;
  }

  async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        employees.*,
        departments.name as department_name,
        designations.title as designation_title,
        master_gender.name as gender_name,
        master_blood_group.name as blood_group_name,
        master_marital_status.name as marital_status_name,
        master_employment_type.name as employment_type_name,
        CONCAT(manager.first_name, ' ', manager.last_name) as reporting_manager_name
      FROM employees
      LEFT JOIN departments ON employees.department_id = departments.id
      LEFT JOIN designations ON employees.designation_id = designations.id
      LEFT JOIN master_gender ON employees.gender_id = master_gender.id
      LEFT JOIN master_blood_group ON employees.blood_group_id = master_blood_group.id
      LEFT JOIN master_marital_status ON employees.marital_status_id = master_marital_status.id
      LEFT JOIN master_employment_type ON employees.employment_type_id = master_employment_type.id
      LEFT JOIN employees as manager ON employees.reporting_manager_id = manager.id
      WHERE employees.id = ? AND employees.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async getByCode(code) {
    const [rows] = await pool.execute(`SELECT * FROM employees WHERE employee_code = ? AND is_deleted = 0`, [code]);
    return rows[0];
  }

  async getByEmail(email) {
    const [rows] = await pool.execute(`SELECT * FROM employees WHERE email = ? AND is_deleted = 0`, [email]);
    return rows[0];
  }

  async create(data) {
    const entries = Object.entries(data).filter(([field]) => employeeCreateFields.has(field));
    const fields = entries.map(([field]) => field);
    const placeholders = fields.map(() => '?').join(', ');
    const values = entries.map(([, value]) => value);

    const query = `INSERT INTO employees (${fields.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.execute(query, values);
    return result.insertId;
  }

  async update(id, data) {
    const entries = Object.entries(data).filter(([field]) => employeeUpdateFields.has(field));
    const fields = entries.map(([field]) => field);
    if (fields.length === 0) return 0;
    const updates = fields.map(field => `${field} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    values.push(id);

    const query = `UPDATE employees SET ${updates} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  async softDelete(id) {
    const [result] = await pool.execute(`UPDATE employees SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  async getLastEmployeeCode() {
    const [rows] = await pool.execute(`
      SELECT employee_code 
      FROM employees 
      WHERE employee_code LIKE 'EMP%' 
      ORDER BY CAST(SUBSTRING(employee_code, 4) AS UNSIGNED) DESC 
      LIMIT 1
    `);
    return rows.length ? rows[0].employee_code : null;
  }

  async getByDepartment(departmentId) {
    const [rows] = await pool.execute(`SELECT * FROM employees WHERE department_id = ? AND is_deleted = 0`, [departmentId]);
    return rows;
  }

  async getByManager(managerId) {
    const [rows] = await pool.execute(`SELECT * FROM employees WHERE reporting_manager_id = ? AND is_deleted = 0`, [managerId]);
    return rows;
  }

  // Bank Details
  async createBankDetails(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO employee_bank_details (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateBankDetails(employeeId, data) {
    const fields = Object.keys(data);
    const updates = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(data);
    values.push(employeeId);
    const [result] = await pool.execute(`UPDATE employee_bank_details SET ${updates} WHERE employee_id = ?`, values);
    return result.affectedRows;
  }

  async getBankDetails(employeeId) {
    const [rows] = await pool.execute(`SELECT * FROM employee_bank_details WHERE employee_id = ? AND is_deleted = 0`, [employeeId]);
    return rows[0];
  }

  // Emergency Contacts
  async createEmergencyContact(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO employee_emergency_contacts (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateEmergencyContact(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE employee_emergency_contacts SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async deleteEmergencyContact(id) {
    const [result] = await pool.execute(`UPDATE employee_emergency_contacts SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  async getEmergencyContacts(employeeId) {
    const [rows] = await pool.execute(`SELECT * FROM employee_emergency_contacts WHERE employee_id = ? AND is_deleted = 0`, [employeeId]);
    return rows;
  }

  // Salary Structure
  async createSalaryStructure(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO salary_structures (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateSalaryStructure(employeeId, data) {
    const fields = Object.keys(data);
    const updates = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(data);
    values.push(employeeId);
    const [result] = await pool.execute(`UPDATE salary_structures SET ${updates} WHERE employee_id = ?`, values);
    return result.affectedRows;
  }

  async getSalaryStructure(employeeId) {
    const [rows] = await pool.execute(`SELECT * FROM salary_structures WHERE employee_id = ? AND is_deleted = 0`, [employeeId]);
    return rows[0];
  }
}

export default new EmployeeModel();
