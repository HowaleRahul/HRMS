import express from 'express';
import { check } from 'express-validator';
import {
  getJobOpenings, getJobOpeningById, createJobOpening, updateJobOpening, deleteJobOpening,
  getCandidates, getCandidateById, createCandidate, updateCandidate, deleteCandidate,
  getApplications, getApplicationById, createApplication, updateApplicationStatus,
  getInterviews, getInterviewById, createInterview, updateInterview
} from '../controllers/recruitment.controller.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Jobs
router.get('/jobs', authenticate, checkPermission('recruitment', 'view'), getJobOpenings);
router.get('/jobs/:id', authenticate, checkPermission('recruitment', 'view'), getJobOpeningById);
router.post('/jobs', authenticate, checkPermission('recruitment', 'create'), [
  check('title', 'Title is required').notEmpty(), check('department_id', 'Department is required').isInt()
], createJobOpening);
router.put('/jobs/:id', authenticate, checkPermission('recruitment', 'update'), updateJobOpening);
router.delete('/jobs/:id', authenticate, checkPermission('recruitment', 'delete'), deleteJobOpening);

// Candidates
router.get('/candidates', authenticate, checkPermission('recruitment', 'view'), getCandidates);
router.get('/candidates/:id', authenticate, checkPermission('recruitment', 'view'), getCandidateById);
router.post('/candidates', authenticate, checkPermission('recruitment', 'create'), [
  check('first_name', 'First name required').notEmpty(), check('email', 'Email required').isEmail()
], createCandidate);
router.put('/candidates/:id', authenticate, checkPermission('recruitment', 'update'), updateCandidate);
router.delete('/candidates/:id', authenticate, checkPermission('recruitment', 'delete'), deleteCandidate);

// Applications
router.get('/applications', authenticate, checkPermission('recruitment', 'view'), getApplications);
router.get('/applications/:id', authenticate, checkPermission('recruitment', 'view'), getApplicationById);
router.post('/applications', authenticate, checkPermission('recruitment', 'create'), [
  check('job_opening_id', 'Job Opening ID required').isInt(), check('candidate_id', 'Candidate ID required').isInt()
], createApplication);
router.put('/applications/:id/status', authenticate, checkPermission('recruitment', 'update'), updateApplicationStatus);

// Interviews
router.get('/interviews', authenticate, checkPermission('recruitment', 'view'), getInterviews);
router.get('/interviews/:id', authenticate, checkPermission('recruitment', 'view'), getInterviewById);
router.post('/interviews', authenticate, checkPermission('recruitment', 'create'), [
  check('job_application_id', 'Job Application ID required').isInt(), check('interviewer_id', 'Interviewer ID required').isInt(),
  check('interview_date', 'Interview date required').notEmpty()
], createInterview);
router.put('/interviews/:id', authenticate, checkPermission('recruitment', 'update'), updateInterview);

export default router;
