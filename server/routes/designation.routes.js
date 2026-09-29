import express from 'express';
import { check } from 'express-validator';
import {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation
} from '../controllers/designation.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('designations', 'view'), getAllDesignations);
router.get('/:id', authenticate, checkPermission('designations', 'view'), getDesignationById);

router.post('/',
  authenticate,
  checkPermission('designations', 'create'),
  [
    check('title', 'Title is required').notEmpty()
  ],
  createDesignation
);

router.put('/:id',
  authenticate,
  checkPermission('designations', 'update'),
  [
    check('title', 'Title is required').optional().notEmpty()
  ],
  updateDesignation
);

router.delete('/:id', authenticate, checkPermission('designations', 'delete'), deleteDesignation);

export default router;
