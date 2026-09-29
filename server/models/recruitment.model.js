import pool from '../config/db.js';

class RecruitmentModel {
  // Job Openings
  async getJobOpenings(filters = {}) {
    const { search, department_id, status, page = 1, limit = 10 } = filters;
    let query = `
      SELECT j.*, d.name as department_name, des.title as designation_title, 
             e.name as employment_type_name, u.username as posted_by_name
      FROM job_openings j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN designations des ON j.designation_id = des.id
      LEFT JOIN master_employment_type e ON j.employment_type_id = e.id
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (j.title LIKE ?)`;
      params.push(`%${search}%`);
    }
    if (department_id) { query += ` AND j.department_id = ?`; params.push(department_id); }
    if (status) { query += ` AND j.status = ?`; params.push(status); }
    query += ` ORDER BY j.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getJobOpeningCount(filters = {}) {
    const { search, department_id, status } = filters;
    let query = `SELECT COUNT(*) as total FROM job_openings j WHERE j.is_deleted = 0`;
    const params = [];
    if (search) { query += ` AND (j.title LIKE ?)`; params.push(`%${search}%`); }
    if (department_id) { query += ` AND j.department_id = ?`; params.push(department_id); }
    if (status) { query += ` AND j.status = ?`; params.push(status); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getJobOpeningById(id) {
    const [rows] = await pool.execute(`
      SELECT j.*, d.name as department_name, des.title as designation_title, 
             e.name as employment_type_name, u.username as posted_by_name,
             (SELECT COUNT(*) FROM job_applications WHERE job_opening_id = j.id AND is_deleted = 0) as application_count
      FROM job_openings j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN designations des ON j.designation_id = des.id
      LEFT JOIN master_employment_type e ON j.employment_type_id = e.id
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.id = ? AND j.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async createJobOpening(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO job_openings (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateJobOpening(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE job_openings SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async deleteJobOpening(id) {
    const [result] = await pool.execute(`UPDATE job_openings SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  // Candidates
  async getCandidates(filters = {}) {
    const { search, page = 1, limit = 10 } = filters;
    let query = `SELECT * FROM candidates WHERE is_deleted = 0`;
    const params = [];
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ` ORDER BY created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getCandidateCount(filters = {}) {
    const { search } = filters;
    let query = `SELECT COUNT(*) as total FROM candidates WHERE is_deleted = 0`;
    const params = [];
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getCandidateById(id) {
    const [rows] = await pool.execute(`SELECT * FROM candidates WHERE id = ? AND is_deleted = 0`, [id]);
    if (!rows[0]) return null;
    
    const [applications] = await pool.execute(`
      SELECT a.*, j.title as job_title, s.name as status_name
      FROM job_applications a
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN master_candidate_status s ON a.status_id = s.id
      WHERE a.candidate_id = ? AND a.is_deleted = 0
    `, [id]);
    
    const [interviews] = await pool.execute(`
      SELECT i.*, j.title as job_title, s.name as status_name, 
             CONCAT(e.first_name, ' ', e.last_name) as interviewer_name
      FROM interviews i
      JOIN job_applications a ON i.job_application_id = a.id
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN master_interview_status s ON i.status_id = s.id
      JOIN employees e ON i.interviewer_id = e.id
      WHERE a.candidate_id = ? AND i.is_deleted = 0
    `, [id]);
    
    return { ...rows[0], applications, interviews };
  }

  async createCandidate(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO candidates (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateCandidate(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE candidates SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async deleteCandidate(id) {
    const [result] = await pool.execute(`UPDATE candidates SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  // Applications
  async getApplications(filters = {}) {
    const { job_opening_id, candidate_id, status_id, page = 1, limit = 10 } = filters;
    let query = `
      SELECT a.*, j.title as job_title, s.name as status_name,
             CONCAT(c.first_name, ' ', c.last_name) as candidate_name, c.email as candidate_email
      FROM job_applications a
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN master_candidate_status s ON a.status_id = s.id
      WHERE a.is_deleted = 0
    `;
    const params = [];
    if (job_opening_id) { query += ` AND a.job_opening_id = ?`; params.push(job_opening_id); }
    if (candidate_id) { query += ` AND a.candidate_id = ?`; params.push(candidate_id); }
    if (status_id) { query += ` AND a.status_id = ?`; params.push(status_id); }
    query += ` ORDER BY a.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getApplicationCount(filters = {}) {
    const { job_opening_id, candidate_id, status_id } = filters;
    let query = `SELECT COUNT(*) as total FROM job_applications a WHERE a.is_deleted = 0`;
    const params = [];
    if (job_opening_id) { query += ` AND a.job_opening_id = ?`; params.push(job_opening_id); }
    if (candidate_id) { query += ` AND a.candidate_id = ?`; params.push(candidate_id); }
    if (status_id) { query += ` AND a.status_id = ?`; params.push(status_id); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getApplicationById(id) {
    const [rows] = await pool.execute(`
      SELECT a.*, j.title as job_title, s.name as status_name,
             CONCAT(c.first_name, ' ', c.last_name) as candidate_name, c.email as candidate_email
      FROM job_applications a
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN master_candidate_status s ON a.status_id = s.id
      WHERE a.id = ? AND a.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async createApplication(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO job_applications (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateApplicationStatus(id, statusId, remarks) {
    const [result] = await pool.execute(`UPDATE job_applications SET status_id = ?, remarks = ? WHERE id = ?`, [statusId, remarks, id]);
    return result.affectedRows;
  }

  // Interviews
  async getInterviews(filters = {}) {
    const { job_application_id, status_id, interviewer_id, page = 1, limit = 10 } = filters;
    let query = `
      SELECT i.*, a.job_opening_id, j.title as job_title, s.name as status_name,
             CONCAT(c.first_name, ' ', c.last_name) as candidate_name,
             CONCAT(e.first_name, ' ', e.last_name) as interviewer_name
      FROM interviews i
      JOIN job_applications a ON i.job_application_id = a.id
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN master_interview_status s ON i.status_id = s.id
      JOIN employees e ON i.interviewer_id = e.id
      WHERE i.is_deleted = 0
    `;
    const params = [];
    if (job_application_id) { query += ` AND i.job_application_id = ?`; params.push(job_application_id); }
    if (status_id) { query += ` AND i.status_id = ?`; params.push(status_id); }
    if (interviewer_id) { query += ` AND i.interviewer_id = ?`; params.push(interviewer_id); }
    query += ` ORDER BY i.interview_date DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getInterviewCount(filters = {}) {
    const { job_application_id, status_id, interviewer_id } = filters;
    let query = `SELECT COUNT(*) as total FROM interviews i WHERE i.is_deleted = 0`;
    const params = [];
    if (job_application_id) { query += ` AND i.job_application_id = ?`; params.push(job_application_id); }
    if (status_id) { query += ` AND i.status_id = ?`; params.push(status_id); }
    if (interviewer_id) { query += ` AND i.interviewer_id = ?`; params.push(interviewer_id); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getInterviewById(id) {
    const [rows] = await pool.execute(`
      SELECT i.*, a.job_opening_id, j.title as job_title, s.name as status_name,
             CONCAT(c.first_name, ' ', c.last_name) as candidate_name,
             CONCAT(e.first_name, ' ', e.last_name) as interviewer_name
      FROM interviews i
      JOIN job_applications a ON i.job_application_id = a.id
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN master_interview_status s ON i.status_id = s.id
      JOIN employees e ON i.interviewer_id = e.id
      WHERE i.id = ? AND i.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async createInterview(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO interviews (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateInterview(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE interviews SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }
}

export default new RecruitmentModel();
