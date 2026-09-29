import { validationResult } from 'express-validator';
import DepartmentModel from '../models/department.model.js';
import pool from '../config/db.js';

const createAuditLog = async (userId, action, module, recordId, oldValues, newValues) => {
  try {
    const query = `INSERT INTO audit_logs (user_id, action, module, record_id, old_values, new_values) VALUES (?, ?, ?, ?, ?, ?)`;
    await pool.execute(query, [userId || null, action, module, recordId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null]);
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      is_active: req.query.is_active !== undefined ? req.query.is_active : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const departments = await DepartmentModel.getAll(filters);
    const total = await DepartmentModel.getCount(filters);

    res.status(200).json({
      success: true,
      data: departments,
      pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await DepartmentModel.getById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createDepartment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const insertId = await DepartmentModel.create(req.body);
    await createAuditLog(req.user?.id, 'CREATE', 'departments', insertId, null, req.body);
    res.status(201).json({ success: true, message: 'Department created', data: { id: insertId } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateDepartment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const existing = await DepartmentModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    await DepartmentModel.update(req.params.id, req.body);
    await createAuditLog(req.user?.id, 'UPDATE', 'departments', req.params.id, existing, req.body);
    res.status(200).json({ success: true, message: 'Department updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const empCount = await DepartmentModel.getEmployeeCount(req.params.id);
    if (empCount > 0) return res.status(400).json({ success: false, message: 'Cannot delete department with active employees' });

    const existing = await DepartmentModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    await DepartmentModel.softDelete(req.params.id);
    await createAuditLog(req.user?.id, 'DELETE', 'departments', req.params.id, existing, { is_deleted: 1 });
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
