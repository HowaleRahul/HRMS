import express from 'express';
import { body } from 'express-validator';
import * as PayrollController from '../controllers/payroll.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('payroll', 'view'), PayrollController.getAllPayroll);
router.get('/summary', authenticate, checkPermission('payroll', 'view'), PayrollController.getMonthlyPayrollSummary);
router.get('/:id', authenticate, checkPermission('payroll', 'view'), PayrollController.getPayrollById);

router.post('/generate', authenticate, checkPermission('payroll', 'create'), validate([
  body('employee_id').isInt({ min: 1 }).withMessage('Employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('basic_salary').isFloat({ min: 0 }).withMessage('Basic salary must be nonnegative'),
  ...['hra', 'da', 'transport_allowance', 'medical_allowance', 'special_allowance', 'overtime_pay', 'bonus', 'pf_employee', 'pf_employer', 'professional_tax', 'tds', 'esi', 'other_deductions'].map(field =>
    body(field).optional().isFloat({ min: 0 }).withMessage(`${field} must be nonnegative`)
  )
]), PayrollController.generatePayroll);

router.post('/bulk-generate', authenticate, checkPermission('payroll', 'create'), PayrollController.bulkGeneratePayroll);
router.post('/generate-structured', authenticate, checkPermission('payroll', 'create'), PayrollController.generateFromSalaryStructures);

router.put('/:id', authenticate, checkPermission('payroll', 'update'), PayrollController.updatePayroll);

router.put('/:id/status', authenticate, checkPermission('payroll', 'approve'), validate([
  body('status').isIn(['pending', 'processed', 'paid', 'hold']).withMessage('Invalid status')
]), PayrollController.updatePaymentStatus);

router.delete('/:id', authenticate, checkPermission('payroll', 'delete'), PayrollController.deletePayroll);

router.get('/:id/payslip', authenticate, checkPermission('payroll', 'view'), PayrollController.generatePayslipPDF);

export default router;
