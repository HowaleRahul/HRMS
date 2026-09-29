import express from 'express';
import { check } from 'express-validator';
import {
  getAllDocuments, getDocumentById, getEmployeeDocuments, downloadDocument, uploadDocument, deleteDocument, verifyDocument
} from '../controllers/document.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('documents', 'view'), getAllDocuments);
router.get('/employee/:employeeId', authenticate, checkPermission('documents', 'view'), getEmployeeDocuments);
router.get('/:id/download', authenticate, checkPermission('documents', 'view'), downloadDocument);
router.get('/:id', authenticate, checkPermission('documents', 'view'), getDocumentById);

router.post('/', authenticate, checkPermission('documents', 'create'), uploadSingle('file'), [
  check('employee_id', 'Employee ID required').isInt(),
  check('document_type_id', 'Document Type ID required').isInt(),
  check('title', 'Title required').notEmpty().isLength({ max: 200 }),
  check('document_number').optional({ checkFalsy: true }).isLength({ max: 100 }),
  check('expiry_date').optional({ checkFalsy: true }).isISO8601()
], uploadDocument);

router.delete('/:id', authenticate, checkPermission('documents', 'delete'), deleteDocument);
router.put('/:id/verify', authenticate, checkPermission('documents', 'approve'), verifyDocument);

export default router;
