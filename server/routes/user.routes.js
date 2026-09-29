import express from 'express';
import { body } from 'express-validator';
import * as UserController from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/roles', authenticate, UserController.getRoles);
router.post('/roles', authenticate, checkPermission('users', 'create'), validate([
  body('name').notEmpty().withMessage('Role name is required')
]), UserController.createRole);
router.get('/roles/:id', authenticate, UserController.getRoleById);
router.put('/roles/:id', authenticate, checkPermission('users', 'update'), UserController.updateRole);
router.delete('/roles/:id', authenticate, checkPermission('users', 'delete'), UserController.deleteRole);

router.get('/permissions', authenticate, UserController.getPermissions);
router.get('/roles/:id/permissions', authenticate, UserController.getRolePermissions);
router.put('/roles/:id/permissions', authenticate, checkPermission('users', 'update'), UserController.updateRolePermissions);

router.get('/', authenticate, checkPermission('users', 'view'), UserController.getAllUsers);
router.get('/:id', authenticate, checkPermission('users', 'view'), UserController.getUserById);

router.post('/', authenticate, checkPermission('users', 'create'), validate([
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
  body('role_id').isInt().withMessage('Role ID is required')
]), UserController.createUser);

router.put('/:id', authenticate, checkPermission('users', 'update'), validate([
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
  body('role_id').isInt({ min: 1 }).withMessage('Role ID is required'),
  body('is_active').isInt({ min: 0, max: 1 }).withMessage('Active status must be 0 or 1')
]), UserController.updateUser);
router.delete('/:id', authenticate, checkPermission('users', 'delete'), UserController.deleteUser);

export default router;
