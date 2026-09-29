import express from 'express';
import { check } from 'express-validator';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('departments', 'view'), getAllDepartments);
router.get('/:id', authenticate, checkPermission('departments', 'view'), getDepartmentById);

router.post('/',
  authenticate,
  checkPermission('departments', 'create'),
  [
    check('name', 'Name is required').notEmpty(),
    check('code', 'Code is required and max 10 chars').notEmpty().isLength({ max: 10 })
  ],
  createDepartment
);

router.put('/:id',
  authenticate,
  checkPermission('departments', 'update'),
  [
    check('name', 'Name is required').optional().notEmpty(),
    check('code', 'Code is required and max 10 chars').optional().notEmpty().isLength({ max: 10 })
  ],
  updateDepartment
);

router.delete('/:id', authenticate, checkPermission('departments', 'delete'), deleteDepartment);

export default router;
