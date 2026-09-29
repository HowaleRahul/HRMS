import express from 'express';
import * as DashboardController from '../controllers/dashboard.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('reports', 'view'), DashboardController.getDashboardStats);

export default router;
