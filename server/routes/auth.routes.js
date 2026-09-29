import express from 'express';
import { body } from 'express-validator';
import * as AuthController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, validate([
  body('username').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
]), AuthController.login);

router.get('/profile', authenticate, AuthController.getProfile);

router.post('/refresh-token', validate([
  body('token').notEmpty().withMessage('Refresh token is required')
]), AuthController.refreshToken);

router.post('/forgot-password', validate([
  body('email').isEmail().withMessage('Valid email is required')
]), AuthController.forgotPassword);

router.post('/reset-password', validate([
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
]), AuthController.resetPassword);

router.put('/change-password', authenticate, validate([
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
]), AuthController.changePassword);

router.post('/logout', authenticate, AuthController.logout);

export default router;
