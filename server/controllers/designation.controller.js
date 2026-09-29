import { validationResult } from 'express-validator';
import DesignationModel from '../models/designation.model.js';
import pool from '../config/db.js';

export const getAllDesignations = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      department_id: req.query.department_id,
      is_active: req.query.is_active !== undefined ? req.query.is_active : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    const designations = await DesignationModel.getAll(filters);
    const total = await DesignationModel.getCount(filters);
    res.status(200).json({ success: true, data: designations, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getDesignationById = async (req, res) => {
  try {
    const desig = await DesignationModel.getById(req.params.id);
    if (!desig) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: desig });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createDesignation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const insertId = await DesignationModel.create(req.body);
    res.status(201).json({ success: true, message: 'Designation created', data: { id: insertId } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Title already exists' });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateDesignation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const existing = await DesignationModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    await DesignationModel.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Designation updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Title already exists' });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteDesignation = async (req, res) => {
  try {
    const count = await DesignationModel.getEmployeeCount(req.params.id);
    if (count > 0) return res.status(400).json({ success: false, message: 'Cannot delete designation with active employees' });

    const existing = await DesignationModel.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    await DesignationModel.softDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Designation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
