import express from 'express';
import { check } from 'express-validator';
import {
  getAllAttendance,
  getAttendanceById,
  checkIn,
  checkOut,
  markAttendance,
  bulkMarkAttendance,
  getMonthlyReport,
  getDepartmentReport,
  getAttendanceSettings,
  updateAttendanceSettings,
  getTodayStats
} from '../controllers/attendance.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('attendance', 'view'), getAllAttendance);
router.get('/today-stats', authenticate, checkPermission('attendance', 'view'), getTodayStats);
router.get('/settings', authenticate, checkPermission('attendance', 'view'), getAttendanceSettings);
router.put('/settings', authenticate, checkPermission('attendance', 'update'), updateAttendanceSettings);
router.get('/monthly-report', authenticate, getMonthlyReport);
router.get('/department-report', authenticate, checkPermission('attendance', 'view'), getDepartmentReport);
router.get('/:id', authenticate, getAttendanceById);

router.post('/check-in', authenticate, checkIn);
router.put('/check-out/:id', authenticate, checkOut);

router.post('/mark',
  authenticate,
  checkPermission('attendance', 'create'),
  [
    check('employee_id', 'Employee ID is required').isInt(),
    check('date', 'Date is required').isISO8601(),
    check('status', 'Status is required').notEmpty()
  ],
  markAttendance
);

router.post('/bulk-mark', authenticate, checkPermission('attendance', 'create'), bulkMarkAttendance);

export default router;
