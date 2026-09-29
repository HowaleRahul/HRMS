import express from 'express';
import { check } from 'express-validator';
import {
  getReviews, getReviewById, createReview, updateReview, deleteReview,
  getGoals, getGoalById, createGoal, updateGoal, deleteGoal
} from '../controllers/performance.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/reviews', authenticate, checkPermission('performance', 'view'), getReviews);
router.get('/reviews/:id', authenticate, checkPermission('performance', 'view'), getReviewById);
router.post('/reviews', authenticate, checkPermission('performance', 'create'), [
  check('employee_id', 'Employee ID required').isInt(),
  check('reviewer_id', 'Reviewer ID required').isInt(),
  check('review_period_start', 'Start date required').isISO8601(),
  check('review_period_end', 'End date required').isISO8601()
], createReview);
router.put('/reviews/:id', authenticate, checkPermission('performance', 'update'), updateReview);
router.delete('/reviews/:id', authenticate, checkPermission('performance', 'delete'), deleteReview);

router.get('/goals', authenticate, checkPermission('performance', 'view'), getGoals);
router.get('/goals/:id', authenticate, checkPermission('performance', 'view'), getGoalById);
router.post('/goals', authenticate, checkPermission('performance', 'create'), [
  check('employee_id', 'Employee ID required').isInt(),
  check('title', 'Title required').notEmpty(),
  check('description', 'Description required').notEmpty()
], createGoal);
router.put('/goals/:id', authenticate, checkPermission('performance', 'update'), updateGoal);
router.delete('/goals/:id', authenticate, checkPermission('performance', 'delete'), deleteGoal);

export default router;
