import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const createAuditLog = async (userId, action, module, recordId, oldValues = null, newValues = null, req = null) => {
  try {
    const ipAddress = req ? (req.ip || req.connection?.remoteAddress || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;

    const query = `
      INSERT INTO audit_logs (user_id, action, module, record_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.execute(query, [
      userId || null,
      action || null,
      module || null,
      recordId || null,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress,
      userAgent
    ]);
  } catch (error) {
    logger.error('Failed to create audit log: ' + error.message);
  }
};

export const auditLogMiddleware = (action, module) => {
  return async (req, res, next) => {
    // We bind a function to res.on('finish') to log after the request completes successfully
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Record ID might be in params or body, ideally should be standardized or passed explicitly.
        // For simplicity, we just log basic request info.
        createAuditLog(
          req.user.id,
          action,
          module,
          req.params.id || null,
          null, // Old values hard to get without DB query here
          req.body, // New values
          req
        );
      }
    });
    next();
  };
};
