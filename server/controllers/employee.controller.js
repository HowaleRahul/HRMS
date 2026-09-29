import { validationResult } from 'express-validator';
import EmployeeModel from '../models/employee.model.js';
import pool from '../config/db.js';

const generateEmployeeCode = async () => {
  const lastCode = await EmployeeModel.getLastEmployeeCode();
  if (!lastCode) {
    return 'EMP001';
  }
  const currentNumber = parseInt(lastCode.replace('EMP', ''), 10);
  return `EMP${String(currentNumber + 1).padStart(3, '0')}`;
};

const createAuditLog = async (userId, action, module, recordId, oldValues, newValues) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, module, record_id, old_values, new_values) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [
      userId || null,
      action,
      module,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null
    ]);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      department_id: req.query.department_id,
      designation_id: req.query.designation_id,
      employment_type_id: req.query.employment_type_id,
      is_active: req.query.is_active !== undefined ? req.query.is_active : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const employees = await EmployeeModel.getAll(filters);
    const total = await EmployeeModel.getCount(filters);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeModel.getById(id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const bankDetails = await EmployeeModel.getBankDetails(id);
    const emergencyContacts = await EmployeeModel.getEmergencyContacts(id);
    const salaryStructure = await EmployeeModel.getSalaryStructure(id);

    employee.bank_details = bankDetails || null;
    employee.emergency_contacts = emergencyContacts || [];
    employee.salary_structure = salaryStructure || null;

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const employeeData = req.body;
    
    if (await EmployeeModel.getByEmail(employeeData.email)) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    employeeData.employee_code = await generateEmployeeCode();
    
    if (req.file) {
      employeeData.photo = req.file.path;
    }

    const insertId = await EmployeeModel.create(employeeData);
    await createAuditLog(req.user?.id, 'CREATE', 'employees', insertId, null, employeeData);

    res.status(201).json({ success: true, message: 'Employee created successfully', data: { id: insertId, employee_code: employeeData.employee_code } });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const employeeData = req.body;
    
    const existingEmployee = await EmployeeModel.getById(id);
    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employeeData.email && employeeData.email !== existingEmployee.email) {
      if (await EmployeeModel.getByEmail(employeeData.email)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    if (req.file) {
      employeeData.photo = req.file.path;
    }

    await EmployeeModel.update(id, employeeData);
    await createAuditLog(req.user?.id, 'UPDATE', 'employees', id, existingEmployee, employeeData);

    res.status(200).json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const existingEmployee = await EmployeeModel.getById(id);
    
    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await EmployeeModel.softDelete(id);
    await createAuditLog(req.user?.id, 'DELETE', 'employees', id, existingEmployee, { is_deleted: 1 });

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateBankDetails = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const data = req.body;
    
    const existing = await EmployeeModel.getBankDetails(id);
    if (existing) {
      await EmployeeModel.updateBankDetails(id, data);
    } else {
      data.employee_id = id;
      await EmployeeModel.createBankDetails(data);
    }

    res.status(200).json({ success: true, message: 'Bank details updated successfully' });
  } catch (error) {
    console.error('Error updating bank details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addEmergencyContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const data = req.body;
    data.employee_id = id;
    
    const insertId = await EmployeeModel.createEmergencyContact(data);
    res.status(201).json({ success: true, message: 'Emergency contact added', data: { id: insertId } });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateEmergencyContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { contactId } = req.params;
    const data = req.body;
    
    await EmployeeModel.updateEmergencyContact(contactId, data);
    res.status(200).json({ success: true, message: 'Emergency contact updated' });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    await EmployeeModel.deleteEmergencyContact(contactId);
    res.status(200).json({ success: true, message: 'Emergency contact deleted' });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateSalaryStructure = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const data = req.body;
    
    const existing = await EmployeeModel.getSalaryStructure(id);
    if (existing) {
      await EmployeeModel.updateSalaryStructure(id, data);
    } else {
      data.employee_id = id;
      await EmployeeModel.createSalaryStructure(data);
    }

    res.status(200).json({ success: true, message: 'Salary structure updated' });
  } catch (error) {
    console.error('Error updating salary structure:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
