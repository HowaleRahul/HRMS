import express from 'express';
import { body } from 'express-validator';
import * as NoticeController from '../controllers/notice.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('notices', 'view'), NoticeController.getAllNotices);
router.get('/active', authenticate, NoticeController.getActiveNotices);
router.get('/:id', authenticate, NoticeController.getNoticeById);

router.post('/', authenticate, checkPermission('notices', 'create'), validate([
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
]), NoticeController.createNotice);

router.put('/:id', authenticate, checkPermission('notices', 'update'), NoticeController.updateNotice);
router.delete('/:id', authenticate, checkPermission('notices', 'delete'), NoticeController.deleteNotice);

export default router;
