import express from 'express';
import * as ReportController from '../controllers/report.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/employees', authenticate, checkPermission('reports', 'view'), ReportController.getEmployeeReport);
router.get('/attendance', authenticate, checkPermission('reports', 'view'), ReportController.getAttendanceReport);
router.get('/leaves', authenticate, checkPermission('reports', 'view'), ReportController.getLeaveReport);
router.get('/payroll', authenticate, checkPermission('reports', 'view'), ReportController.getPayrollReport);
router.get('/departments', authenticate, checkPermission('reports', 'view'), ReportController.getDepartmentReport);
router.get('/joining-exit', authenticate, checkPermission('reports', 'view'), ReportController.getJoiningExitReport);

router.get('/export/:type', authenticate, checkPermission('reports', 'export'), ReportController.exportReport);

export default router;
