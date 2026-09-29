import { validationResult } from 'express-validator';
import RecruitmentModel from '../models/recruitment.model.js';
import pool from '../config/db.js';

const createNotification = async (userId, title, message, type, refModule, refId) => {
  if (!userId) return;
  try {
    await pool.execute(`
      INSERT INTO notifications (user_id, title, message, type, reference_module, reference_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, title, message, type, refModule, refId]);
  } catch (err) {
    console.error('Notification error:', err);
  }
};

// Job Openings
export const getJobOpenings = async (req, res) => {
  try {
    const filters = {
      search: req.query.search, department_id: req.query.department_id,
      status: req.query.status, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10
    };
    const data = await RecruitmentModel.getJobOpenings(filters);
    const total = await RecruitmentModel.getJobOpeningCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getJobOpeningById = async (req, res) => {
  try {
    const data = await RecruitmentModel.getJobOpeningById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createJobOpening = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const data = { ...req.body, posted_by: req.user.id, posted_date: new Date().toISOString().split('T')[0] };
    const id = await RecruitmentModel.createJobOpening(data);
    res.status(201).json({ success: true, message: 'Created', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateJobOpening = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    await RecruitmentModel.updateJobOpening(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteJobOpening = async (req, res) => {
  try {
    await RecruitmentModel.deleteJobOpening(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

// Candidates
export const getCandidates = async (req, res) => {
  try {
    const filters = { search: req.query.search, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await RecruitmentModel.getCandidates(filters);
    const total = await RecruitmentModel.getCandidateCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getCandidateById = async (req, res) => {
  try {
    const data = await RecruitmentModel.getCandidateById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createCandidate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const id = await RecruitmentModel.createCandidate(req.body);
    res.status(201).json({ success: true, message: 'Created', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateCandidate = async (req, res) => {
  try {
    await RecruitmentModel.updateCandidate(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteCandidate = async (req, res) => {
  try {
    await RecruitmentModel.deleteCandidate(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

// Applications
export const getApplications = async (req, res) => {
  try {
    const filters = { job_opening_id: req.query.job_opening_id, candidate_id: req.query.candidate_id, status_id: req.query.status_id, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await RecruitmentModel.getApplications(filters);
    const total = await RecruitmentModel.getApplicationCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getApplicationById = async (req, res) => {
  try {
    const data = await RecruitmentModel.getApplicationById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const id = await RecruitmentModel.createApplication(req.body);
    res.status(201).json({ success: true, message: 'Created', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status_id, remarks } = req.body;
    await RecruitmentModel.updateApplicationStatus(req.params.id, status_id, remarks);
    
    // Notification logic
    const app = await RecruitmentModel.getApplicationById(req.params.id);
    if (app) {
      const [jobOwner] = await pool.execute(`SELECT posted_by FROM job_openings WHERE id = ?`, [app.job_opening_id]);
      if (jobOwner.length) {
        await createNotification(jobOwner[0].posted_by, 'Application Status Updated', `Application for ${app.candidate_name} updated to ${app.status_name}`, 'recruitment', 'job_applications', app.id);
      }
    }
    
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

// Interviews
export const getInterviews = async (req, res) => {
  try {
    const filters = { job_application_id: req.query.job_application_id, status_id: req.query.status_id, interviewer_id: req.query.interviewer_id, page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 10 };
    const data = await RecruitmentModel.getInterviews(filters);
    const total = await RecruitmentModel.getInterviewCount(filters);
    res.status(200).json({ success: true, data, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getInterviewById = async (req, res) => {
  try {
    const data = await RecruitmentModel.getInterviewById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const createInterview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const id = await RecruitmentModel.createInterview(req.body);
    // Notify Interviewer
    const [user] = await pool.execute(`SELECT id FROM users WHERE employee_id = ?`, [req.body.interviewer_id]);
    if (user.length) {
      await createNotification(user[0].id, 'New Interview Scheduled', `You have been scheduled for an interview on ${req.body.interview_date}`, 'recruitment', 'interviews', id);
    }
    res.status(201).json({ success: true, message: 'Created', data: { id } });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateInterview = async (req, res) => {
  try {
    await RecruitmentModel.updateInterview(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
