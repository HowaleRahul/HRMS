import express from 'express';
import { body } from 'express-validator';
import * as LeaveController from '../controllers/leave.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/types', authenticate, LeaveController.getLeaveTypes);

router.post('/types', authenticate, checkPermission('leaves', 'create'), validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('default_days').isInt().withMessage('Default days must be an integer')
]), LeaveController.createLeaveType);

router.put('/types/:id', authenticate, checkPermission('leaves', 'update'), LeaveController.updateLeaveType);
router.delete('/types/:id', authenticate, checkPermission('leaves', 'delete'), LeaveController.deleteLeaveType);

router.get('/balances/:employeeId', authenticate, LeaveController.getLeaveBalances);
router.post('/balances/initialize/:employeeId', authenticate, checkPermission('leaves', 'create'), LeaveController.initializeLeaveBalances);

router.get('/requests', authenticate, checkPermission('leaves', 'view'), LeaveController.getLeaveRequests);
router.get('/requests/team', authenticate, LeaveController.getTeamLeaveRequests);
router.get('/requests/pending-count', authenticate, checkPermission('leaves', 'view'), LeaveController.getPendingLeaveCount);
router.get('/requests/:id', authenticate, LeaveController.getLeaveRequestById);

router.post('/requests', authenticate, checkPermission('leaves', 'create'), validate([
  body('leave_type_id').isInt({ min: 1 }).withMessage('Leave type ID required'),
  body('start_date').isDate().withMessage('Valid start date required'),
  body('end_date').isDate().withMessage('Valid end date required'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
]), LeaveController.applyLeave);

router.put('/requests/:id/approve', authenticate, checkPermission('leaves', 'approve'), LeaveController.approveLeave);
router.put('/requests/:id/reject', authenticate, checkPermission('leaves', 'approve'), validate([
  body('reason').notEmpty().withMessage('Rejection reason required')
]), LeaveController.rejectLeave);
router.put('/requests/:id/cancel', authenticate, LeaveController.cancelLeave);

export default router;
