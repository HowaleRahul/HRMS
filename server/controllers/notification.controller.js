import * as NotificationModel from '../models/notification.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/helpers.js';

export const getNotifications = async (req, res) => {
  try {
    const { page, limit: queryLimit, is_read } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const filters = { is_read, limit, offset };
    const notifications = await NotificationModel.getByUser(req.user.id, filters);
    
    return successResponse(res, notifications);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationModel.getUnreadCount(req.user.id);
    return successResponse(res, { count });
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const markAsRead = async (req, res) => {
  try {
    await NotificationModel.markAsRead(req.params.id, req.user.id);
    return successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await NotificationModel.markAllAsRead(req.user.id);
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const affectedRows = await NotificationModel.softDelete(req.params.id, req.user.id);
    if (affectedRows === 0) return errorResponse(res, 'Notification not found', 404);
    return successResponse(res, null, 'Notification deleted');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};
