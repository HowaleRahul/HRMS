import express from 'express';
import * as DashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, DashboardController.getDashboardStats);

export default router;
