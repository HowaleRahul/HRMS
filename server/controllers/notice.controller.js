import * as NoticeModel from '../models/notice.model.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/helpers.js';

export const getAllNotices = async (req, res) => {
  try {
    const { page, limit: queryLimit } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const filters = { ...req.query, limit, offset };
    const notices = await NoticeModel.getAll(filters);
    const total = await NoticeModel.getCount(filters);
    
    return paginatedResponse(res, notices, total, page || 1, limit);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getActiveNotices = async (req, res) => {
  try {
    const notices = await NoticeModel.getActiveNotices();
    return successResponse(res, notices);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const notice = await NoticeModel.getById(req.params.id);
    if (!notice) return errorResponse(res, 'Notice not found', 404);
    return successResponse(res, notice);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const createNotice = async (req, res) => {
  try {
    const data = { ...req.body, published_by: req.user.id };
    const id = await NoticeModel.create(data);
    return successResponse(res, { id }, 'Notice created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updateNotice = async (req, res) => {
  try {
    await NoticeModel.update(req.params.id, req.body);
    return successResponse(res, null, 'Notice updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deleteNotice = async (req, res) => {
  try {
    await NoticeModel.softDelete(req.params.id);
    return successResponse(res, null, 'Notice deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};
