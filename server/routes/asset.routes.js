import express from 'express';
import { check } from 'express-validator';
import {
  getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset,
  getAssignments, getAssignmentsByEmployee, assignAsset, returnAsset
} from '../controllers/asset.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('assets', 'view'), getAllAssets);
router.get('/assignments', authenticate, checkPermission('assets', 'view'), getAssignments);
router.get('/assignments/employee/:employeeId', authenticate, getAssignmentsByEmployee);
router.get('/:id', authenticate, checkPermission('assets', 'view'), getAssetById);

router.post('/', authenticate, checkPermission('assets', 'create'), [
  check('name', 'Name required').notEmpty(), check('asset_type_id', 'Asset Type required').isInt()
], createAsset);
router.put('/:id', authenticate, checkPermission('assets', 'update'), updateAsset);
router.delete('/:id', authenticate, checkPermission('assets', 'delete'), deleteAsset);

router.post('/assign', authenticate, checkPermission('assets', 'create'), [
  check('asset_id', 'Asset ID required').isInt(), check('employee_id', 'Employee ID required').isInt(),
  check('assigned_date', 'Assigned Date required').notEmpty()
], assignAsset);

router.put('/assignments/:id/return', authenticate, checkPermission('assets', 'update'), [
  check('returned_date', 'Returned Date required').notEmpty()
], returnAsset);

export default router;
