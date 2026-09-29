import { validationResult } from 'express-validator';
import PerformanceModel from '../models/performance.model.js';

// Reviews
export const getReviews = async (req, res) => {
  try {
    const filters = { employee_id: req.query.employee_id, reviewer_id: req.query.reviewer_id, status: req.query.status, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await PerformanceModel.getReviews(filters);
    const total = await PerformanceModel.getReviewCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getReviewById = async (req, res) => {
  try {
    const data = await PerformanceModel.getReviewById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const id = await PerformanceModel.createReview(req.body);
    res.status(201).json({ success: true, message: 'Created', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateReview = async (req, res) => {
  try {
    await PerformanceModel.updateReview(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteReview = async (req, res) => {
  try {
    await PerformanceModel.deleteReview(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

// Goals
export const getGoals = async (req, res) => {
  try {
    const filters = { employee_id: req.query.employee_id, review_id: req.query.review_id, status: req.query.status, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await PerformanceModel.getGoals(filters);
    const total = await PerformanceModel.getGoalCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getGoalById = async (req, res) => {
  try {
    const data = await PerformanceModel.getGoalById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createGoal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const id = await PerformanceModel.createGoal(req.body);
    res.status(201).json({ success: true, message: 'Created', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateGoal = async (req, res) => {
  try {
    await PerformanceModel.updateGoal(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteGoal = async (req, res) => {
  try {
    await PerformanceModel.deleteGoal(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
