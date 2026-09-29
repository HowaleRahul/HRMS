import * as HolidayModel from '../models/holiday.model.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/helpers.js';

export const getAllHolidays = async (req, res) => {
  try {
    const { page, limit: queryLimit } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const filters = { ...req.query, limit, offset };
    const holidays = await HolidayModel.getAll(filters);
    const total = await HolidayModel.getCount(filters);
    
    return paginatedResponse(res, holidays, total, page || 1, limit);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getByYear = async (req, res) => {
  try {
    const holidays = await HolidayModel.getByYear(req.params.year);
    return successResponse(res, holidays);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getUpcoming = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const holidays = await HolidayModel.getUpcoming(limit);
    return successResponse(res, holidays);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getHolidayById = async (req, res) => {
  try {
    const holiday = await HolidayModel.getById(req.params.id);
    if (!holiday) return errorResponse(res, 'Holiday not found', 404);
    return successResponse(res, holiday);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const createHoliday = async (req, res) => {
  try {
    const id = await HolidayModel.create(req.body);
    return successResponse(res, { id }, 'Holiday created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updateHoliday = async (req, res) => {
  try {
    await HolidayModel.update(req.params.id, req.body);
    return successResponse(res, null, 'Holiday updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    await HolidayModel.softDelete(req.params.id);
    return successResponse(res, null, 'Holiday deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};
