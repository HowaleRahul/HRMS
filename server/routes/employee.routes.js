import express from 'express';
import { check } from 'express-validator';
import {
  getAllEmployees,
  getEmployeeFormOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateBankDetails,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  updateSalaryStructure
} from '../controllers/employee.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('employees', 'view'), getAllEmployees);
router.get('/form-options', authenticate, getEmployeeFormOptions);

router.get('/:id', authenticate, checkPermission('employees', 'view'), getEmployeeById);

router.post('/', 
  authenticate, 
  checkPermission('employees', 'create'), 
  uploadSingle('photo'),
  [
    check('first_name', 'First name is required').notEmpty(),
    check('last_name', 'Last name is required').notEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('phone', 'Phone number is required').notEmpty(),
    check('date_of_birth', 'Date of birth is required').isISO8601(),
    check('gender_id', 'Gender ID is required').isInt(),
    check('department_id', 'Department ID is required').isInt(),
    check('designation_id', 'Designation ID is required').isInt(),
    check('employment_type_id', 'Employment type ID is required').isInt(),
    check('joining_date', 'Joining date is required').isISO8601(),
    check('current_address', 'Current address is required').notEmpty()
  ], 
  createEmployee
);

router.put('/:id', 
  authenticate, 
  checkPermission('employees', 'update'), 
  uploadSingle('photo'),
  [
    check('first_name', 'First name is required').optional().notEmpty(),
    check('last_name', 'Last name is required').optional().notEmpty(),
    check('email', 'Valid email is required').optional().isEmail()
  ], 
  updateEmployee
);

router.delete('/:id', authenticate, checkPermission('employees', 'delete'), deleteEmployee);

router.put('/:id/bank-details', 
  authenticate, 
  checkPermission('employees', 'update'), 
  [
    check('bank_name', 'Bank name is required').notEmpty(),
    check('account_number', 'Account number is required').notEmpty(),
    check('ifsc_code', 'IFSC code is required').notEmpty(),
    check('branch_name', 'Branch name is required').notEmpty()
  ],
  updateBankDetails
);

router.post('/:id/emergency-contacts', 
  authenticate, 
  checkPermission('employees', 'update'), 
  [
    check('contact_name', 'Contact name is required').notEmpty(),
    check('relationship', 'Relationship is required').notEmpty(),
    check('phone', 'Phone is required').notEmpty()
  ],
  addEmergencyContact
);

router.put('/:id/emergency-contacts/:contactId', 
  authenticate, 
  checkPermission('employees', 'update'), 
  [
    check('contact_name', 'Contact name is required').optional().notEmpty(),
    check('relationship', 'Relationship is required').optional().notEmpty(),
    check('phone', 'Phone is required').optional().notEmpty()
  ],
  updateEmergencyContact
);

router.delete('/:id/emergency-contacts/:contactId', authenticate, checkPermission('employees', 'update'), deleteEmergencyContact);

router.put('/:id/salary', 
  authenticate, 
  checkPermission('employees', 'update'), 
  [
    check('basic_salary', 'Basic salary is required').isNumeric(),
    check('effective_from', 'Effective from date is required').isISO8601()
  ],
  updateSalaryStructure
);

export default router;
