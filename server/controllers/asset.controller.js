import { validationResult } from 'express-validator';
import AssetModel from '../models/asset.model.js';

export const getAllAssets = async (req, res) => {
  try {
    const filters = { search: req.query.search, asset_type_id: req.query.asset_type_id, status: req.query.status, condition: req.query.condition, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await AssetModel.getAll(filters);
    const total = await AssetModel.getCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getAssetById = async (req, res) => {
  try {
    const data = await AssetModel.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createAsset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const lastCode = await AssetModel.getLastAssetCode();
    const nextNum = lastCode ? parseInt(lastCode.replace('AST', '')) + 1 : 1;
    const asset_code = `AST${String(nextNum).padStart(3, '0')}`;
    
    const id = await AssetModel.create({ ...req.body, asset_code });
    res.status(201).json({ success: true, message: 'Created', data: { id, asset_code } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateAsset = async (req, res) => {
  try {
    await AssetModel.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await AssetModel.getById(req.params.id);
    if (asset && asset.current_assignment) {
      return res.status(400).json({ success: false, message: 'Cannot delete assigned asset' });
    }
    await AssetModel.softDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getAssignments = async (req, res) => {
  try {
    const filters = { asset_id: req.query.asset_id, employee_id: req.query.employee_id, status: req.query.status, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await AssetModel.getAssignments(filters);
    const total = await AssetModel.getAssignmentCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getAssignmentsByEmployee = async (req, res) => {
  try {
    const isHrRole = ['super_admin', 'hr_admin', 'hr_executive'].includes(req.user.role?.name);
    if (Number(req.params.employeeId) !== Number(req.user.employee_id) && !isHrRole) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const data = await AssetModel.getAssignmentsByEmployee(req.params.employeeId);
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const assignAsset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const asset = await AssetModel.getById(req.body.asset_id);
    if (!asset || asset.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Asset is not available' });
    }
    const id = await AssetModel.assignAsset({ ...req.body, assigned_by: req.user.id });
    res.status(201).json({ success: true, message: 'Assigned', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const returnAsset = async (req, res) => {
  try {
    const assignment = await AssetModel.getAssignmentById(req.params.id);
    if (!assignment || assignment.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Invalid assignment' });
    }
    await AssetModel.returnAsset(req.params.id, { ...req.body, asset_id: assignment.asset_id });
    res.status(200).json({ success: true, message: 'Returned' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
