import pool from '../config/db.js';
import * as LeaveModel from '../models/leave.model.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const getLeaveTypes = async (req, res) => {
  try {
    const types = await LeaveModel.getLeaveTypes();
    return successResponse(res, types);
  } catch (error) {
    logger.error('Error fetching leave types: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const createLeaveType = async (req, res) => {
  try {
    const id = await LeaveModel.createLeaveType(req.body);
    return successResponse(res, { id }, 'Leave type created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updateLeaveType = async (req, res) => {
  try {
    await LeaveModel.updateLeaveType(req.params.id, req.body);
    return successResponse(res, null, 'Leave type updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deleteLeaveType = async (req, res) => {
  try {
    await LeaveModel.deleteLeaveType(req.params.id);
    return successResponse(res, null, 'Leave type deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getLeaveBalances = async (req, res) => {
  try {
    const employeeId = req.params.employeeId === 'self' ? req.user.employee_id : Number(req.params.employeeId);
    if (!employeeId) return errorResponse(res, 'Employee profile not found', 403);
    if (Number(employeeId) !== Number(req.user.employee_id)) {
      const [permissions] = await pool.execute(`
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.module = 'leaves' AND p.action = 'view'
      `, [req.user.role_id]);
      if (permissions.length === 0) return errorResponse(res, 'Forbidden.', 403);
    }
    const year = new Date().getFullYear();
    const balances = await LeaveModel.getLeaveBalances(employeeId, year);
    return successResponse(res, balances);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const initializeLeaveBalances = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    await LeaveModel.initializeLeaveBalances(req.params.employeeId, year);
    return successResponse(res, null, 'Leave balances initialized successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const applyLeave = async (req, res) => {
  try {
    const employee_id = req.user.employee_id;
    if (!employee_id) return errorResponse(res, 'Employee profile not found', 403);
    if (req.body.employee_id && Number(req.body.employee_id) !== Number(employee_id)) {
      return errorResponse(res, 'Cannot submit leave for another employee', 403);
    }

    const { leave_type_id, start_date, end_date, reason } = req.body;

    const startTime = Date.parse(`${start_date}T00:00:00Z`);
    const endTime = Date.parse(`${end_date}T00:00:00Z`);
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime) {
      return errorResponse(res, 'Invalid leave date range', 400);
    }
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (startDate.getUTCFullYear() !== endDate.getUTCFullYear()) {
      return errorResponse(res, 'Leave requests cannot span calendar years', 400);
    }
    const requestedDays = Math.floor((endTime - startTime) / 86400000) + 1;

    const id = await LeaveModel.createLeaveRequest({
      employee_id, leave_type_id: Number(leave_type_id), start_date, end_date, total_days: requestedDays, reason
    });
    
    return successResponse(res, { id }, 'Leave request submitted successfully', 201);
  } catch (error) {
    if (['LEAVE_OVERLAP', 'INSUFFICIENT_BALANCE', 'NO_LEAVE_BALANCE', 'EMPLOYEE_NOT_FOUND'].includes(error.code)) {
      return errorResponse(res, error.message, error.code === 'LEAVE_OVERLAP' ? 409 : 400);
    }
    logger.error('Apply leave error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const approveLeave = async (req, res) => {
  try {
    const request = await LeaveModel.getLeaveRequestById(req.params.id);
    if (!request) return errorResponse(res, 'Leave request not found', 404);
    if (request.status !== 'pending') return errorResponse(res, 'Can only approve pending requests', 400);

    await LeaveModel.updateLeaveRequestStatus(req.params.id, 'approved', req.user.id);
    
    // Deduct balance
    const year = new Date(request.start_date).getFullYear();
    const balances = await LeaveModel.getLeaveBalances(request.employee_id, year);
    const balance = balances.find(b => b.leave_type_id === request.leave_type_id);
    
    if (balance) {
      await LeaveModel.updateLeaveBalance(balance.id, balance.used_days + request.total_days);
    }

    return successResponse(res, null, 'Leave approved successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const rejectLeave = async (req, res) => {
  try {
    await LeaveModel.updateLeaveRequestStatus(req.params.id, 'rejected', req.user.id, req.body.reason);
    return successResponse(res, null, 'Leave rejected successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const request = await LeaveModel.getLeaveRequestById(req.params.id);
    if (!request) return errorResponse(res, 'Leave request not found', 404);
    
    // Only allow self cancellation or admin
    if (request.employee_id !== req.user.employee_id && !req.user.role?.name?.includes('Admin')) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    await LeaveModel.cancelLeaveRequest(req.params.id);

    // Refund balance if it was approved
    if (request.status === 'approved') {
      const year = new Date(request.start_date).getFullYear();
      const balances = await LeaveModel.getLeaveBalances(request.employee_id, year);
      const balance = balances.find(b => b.leave_type_id === request.leave_type_id);
      if (balance) {
        await LeaveModel.updateLeaveBalance(balance.id, balance.used_days - request.total_days);
      }
    }

    return successResponse(res, null, 'Leave cancelled successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const { page, limit: queryLimit } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const filters = { ...req.query, limit, offset };
    const requests = await LeaveModel.getLeaveRequests(filters);
    const total = await LeaveModel.getLeaveRequestCount(filters);
    
    return paginatedResponse(res, requests, total, page || 1, limit);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const request = await LeaveModel.getLeaveRequestById(req.params.id);
    if (!request) return errorResponse(res, 'Leave request not found', 404);
    if (Number(request.employee_id) !== Number(req.user.employee_id)) {
      const [permissions] = await pool.execute(`
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.module = 'leaves' AND p.action = 'view'
      `, [req.user.role_id]);
      if (permissions.length === 0) return errorResponse(res, 'Forbidden.', 403);
    }
    return successResponse(res, request);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getTeamLeaveRequests = async (req, res) => {
  try {
    const managerId = req.user.employee_id;
    if (!managerId) return errorResponse(res, 'Manager profile not found', 400);

    const { page, limit: queryLimit } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const requests = await LeaveModel.getTeamLeaveRequests(managerId, { ...req.query, limit, offset });
    return successResponse(res, requests);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getPendingLeaveCount = async (req, res) => {
  try {
    const count = await LeaveModel.getPendingLeaveCount();
    return successResponse(res, { count });
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};
