import express from 'express';
import { body } from 'express-validator';
import * as HolidayController from '../controllers/holiday.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, HolidayController.getAllHolidays);
router.get('/upcoming', authenticate, HolidayController.getUpcoming);
router.get('/year/:year', authenticate, HolidayController.getByYear);
router.get('/:id', authenticate, HolidayController.getHolidayById);

router.post('/', authenticate, checkPermission('notices', 'create'), validate([
  body('name').notEmpty().withMessage('Holiday name is required'),
  body('date').isDate().withMessage('Valid date is required')
]), HolidayController.createHoliday);

router.put('/:id', authenticate, checkPermission('notices', 'update'), HolidayController.updateHoliday);
router.delete('/:id', authenticate, checkPermission('notices', 'delete'), HolidayController.deleteHoliday);

export default router;
