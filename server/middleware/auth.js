import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { errorResponse } from '../utils/apiResponse.js';
import pool from '../config/db.js';
import { tokenBlacklist } from '../utils/tokenBlacklist.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (tokenBlacklist.has(token)) {
      return errorResponse(res, 'Token has been invalidated', 401);
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Fetch user basic info
    const [rows] = await pool.execute(
      `SELECT u.id, u.role_id, u.employee_id, u.is_active, r.name AS role_name, r.display_name AS role_display_name
       FROM users u JOIN roles r ON r.id = u.role_id AND r.is_deleted = 0
       WHERE u.id = ? AND u.is_deleted = 0`,
      [decoded.id]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return errorResponse(res, 'User not found or inactive.', 401);
    }

    req.user = decoded;
    req.user.role_id = rows[0].role_id;
    req.user.employee_id = rows[0].employee_id;
    req.user.role = {
      ...decoded.role,
      id: rows[0].role_id,
      name: rows[0].role_name,
      display_name: rows[0].role_display_name
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired.', 401);
    }
    return errorResponse(res, 'Invalid token.', 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role?.name)) {
      return errorResponse(res, 'Forbidden. You do not have access to this resource.', 403);
    }
    next();
  };
};

export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    try {
      const [rows] = await pool.execute(`
        SELECT rp.id 
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.module = ? AND p.action = ?
      `, [req.user.role_id, module, action]);

      if (rows.length === 0) {
        return errorResponse(res, 'Forbidden. Permission denied.', 403);
      }

      next();
    } catch (error) {
      return errorResponse(res, 'Error checking permissions', 500);
    }
  };
};
