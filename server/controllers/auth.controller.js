import { tokenBlacklist } from '../utils/tokenBlacklist.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as AuthModel from '../models/auth.model.js';
import { config } from '../config/config.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { createAuditLog } from '../middleware/auditLog.js';
import { sendEmail } from '../utils/emailService.js';
import logger from '../utils/logger.js';

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: {
      id: user.role_id,
      name: user.role_name,
      display_name: user.role_display_name
    },
    employee_id: user.employee_id
  };

  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiry });
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });
  
  return { token, refreshToken };
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    let user = await AuthModel.findUserByUsername(username);
    if (!user) {
      // Also try by email if username not found
      user = await AuthModel.findUserByEmail(username);
      if (!user) {
        return errorResponse(res, 'Invalid credentials', 401);
      }
    }

    if (!user.is_active) {
      return errorResponse(res, 'Account is inactive. Please contact administrator.', 403);
    }

    // Check lock
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return errorResponse(res, 'Account is temporarily locked due to too many failed attempts. Please try again later.', 403);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await AuthModel.incrementLoginAttempts(user.id);
      
      const attempts = (user.login_attempts || 0) + 1;
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await AuthModel.lockAccount(user.id, lockUntil);
        await createAuditLog(user.id, 'ACCOUNT_LOCK', 'AUTH', user.id, null, null, req);
        return errorResponse(res, 'Account locked due to 5 failed attempts. Please try again in 15 minutes.', 403);
      }
      
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Success login
    await AuthModel.resetLoginAttempts(user.id);
    await AuthModel.updateLastLogin(user.id);

    const { token, refreshToken } = generateTokens(user);
    const permissions = await AuthModel.getUserPermissions(user.role_id);

    await createAuditLog(user.id, 'LOGIN', 'AUTH', user.id, null, null, req);

    return successResponse(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name,
          display_name: user.role_display_name
        },
        employee_id: user.employee_id
      },
      token,
      refreshToken,
      permissions
    }, 'Login successful');
  } catch (error) {
    logger.error('Login error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await AuthModel.findUserById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const permissions = await AuthModel.getUserPermissions(user.role_id);
    
    return successResponse(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name,
          display_name: user.role_display_name
        },
        employee_id: user.employee_id,
        last_login: user.last_login
      },
      permissions
    }, 'Profile retrieved successfully');
  } catch (error) {
    logger.error('Get profile error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token: refToken } = req.body;
    if (!refToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const decoded = jwt.verify(refToken, config.jwt.refreshSecret);
    const user = await AuthModel.findUserById(decoded.id);
    
    if (!user || !user.is_active) {
      return errorResponse(res, 'Invalid token or inactive user', 401);
    }

    const { token, refreshToken: newRefreshToken } = generateTokens(user);
    
    return successResponse(res, {
      token,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (error) {
    return errorResponse(res, 'Invalid or expired refresh token', 401);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await AuthModel.findUserByEmail(email);
    
    if (!user) {
      // Don't reveal user existence
      return successResponse(res, null, 'If that email is in our database, we will send a reset link to it.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await AuthModel.setPasswordResetToken(user.id, hashedToken, expires);

    const resetUrl = `\${config.clientUrl}/reset-password/\${resetToken}`;
    const emailBody = `
      <p>You requested a password reset</p>
      <p>Click this link to reset your password: <a href="\${resetUrl}">\${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    const emailSent = await sendEmail(user.email, 'Password Reset Request', emailBody);
    
    if (!emailSent) {
      logger.warn(`Email could not be sent to \${user.email}. Password reset link: \${resetUrl}`);
    }

    await createAuditLog(user.id, 'FORGOT_PASSWORD', 'AUTH', user.id, null, null, req);
    
    return successResponse(res, null, 'If that email is in our database, we will send a reset link to it.');
  } catch (error) {
    logger.error('Forgot password error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await AuthModel.findByResetToken(hashedToken);
    
    if (!user || new Date(user.reset_token_expires) < new Date()) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await AuthModel.updatePassword(user.id, hashedPassword);
    await createAuditLog(user.id, 'RESET_PASSWORD', 'AUTH', user.id, null, null, req);

    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    logger.error('Reset password error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await AuthModel.findUserById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await AuthModel.updatePassword(user.id, hashedPassword);
    await createAuditLog(user.id, 'CHANGE_PASSWORD', 'AUTH', user.id, null, null, req);

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    logger.error('Change password error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      tokenBlacklist.add(authHeader.split(' ')[1]);
    }
    await createAuditLog(req.user.id, 'LOGOUT', 'AUTH', req.user.id, null, null, req);
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};
