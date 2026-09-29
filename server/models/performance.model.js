import pool from '../config/db.js';

class PerformanceModel {
  // Reviews
  async getReviews(filters = {}) {
    const { employee_id, reviewer_id, status, page = 1, limit = 10 } = filters;
    let query = `
      SELECT r.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             CONCAT(rev.first_name, ' ', rev.last_name) as reviewer_name,
             m.name as rating_name
      FROM performance_reviews r
      JOIN employees e ON r.employee_id = e.id
      JOIN employees rev ON r.reviewer_id = rev.id
      LEFT JOIN master_performance_rating m ON r.rating_id = m.id
      WHERE r.is_deleted = 0
    `;
    const params = [];
    if (employee_id) { query += ` AND r.employee_id = ?`; params.push(employee_id); }
    if (reviewer_id) { query += ` AND r.reviewer_id = ?`; params.push(reviewer_id); }
    if (status) { query += ` AND r.status = ?`; params.push(status); }
    query += ` ORDER BY r.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getReviewCount(filters = {}) {
    const { employee_id, reviewer_id, status } = filters;
    let query = `SELECT COUNT(*) as total FROM performance_reviews r WHERE r.is_deleted = 0`;
    const params = [];
    if (employee_id) { query += ` AND r.employee_id = ?`; params.push(employee_id); }
    if (reviewer_id) { query += ` AND r.reviewer_id = ?`; params.push(reviewer_id); }
    if (status) { query += ` AND r.status = ?`; params.push(status); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getReviewById(id) {
    const [rows] = await pool.execute(`
      SELECT r.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             CONCAT(rev.first_name, ' ', rev.last_name) as reviewer_name,
             m.name as rating_name
      FROM performance_reviews r
      JOIN employees e ON r.employee_id = e.id
      JOIN employees rev ON r.reviewer_id = rev.id
      LEFT JOIN master_performance_rating m ON r.rating_id = m.id
      WHERE r.id = ? AND r.is_deleted = 0
    `, [id]);
    
    if (!rows[0]) return null;
    
    const [goals] = await pool.execute(`
      SELECT * FROM performance_goals WHERE review_id = ? AND is_deleted = 0
    `, [id]);
    
    return { ...rows[0], goals };
  }

  async createReview(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO performance_reviews (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateReview(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE performance_reviews SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async deleteReview(id) {
    const [result] = await pool.execute(`UPDATE performance_reviews SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  // Goals
  async getGoals(filters = {}) {
    const { employee_id, review_id, status, page = 1, limit = 10 } = filters;
    let query = `
      SELECT g.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name
      FROM performance_goals g
      JOIN employees e ON g.employee_id = e.id
      WHERE g.is_deleted = 0
    `;
    const params = [];
    if (employee_id) { query += ` AND g.employee_id = ?`; params.push(employee_id); }
    if (review_id) { query += ` AND g.review_id = ?`; params.push(review_id); }
    if (status) { query += ` AND g.status = ?`; params.push(status); }
    query += ` ORDER BY g.created_at DESC`;
    if (limit > 0) { query += ` LIMIT ? OFFSET ?`; params.push(Number(limit), Number((page - 1) * limit)); }
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getGoalCount(filters = {}) {
    const { employee_id, review_id, status } = filters;
    let query = `SELECT COUNT(*) as total FROM performance_goals g WHERE g.is_deleted = 0`;
    const params = [];
    if (employee_id) { query += ` AND g.employee_id = ?`; params.push(employee_id); }
    if (review_id) { query += ` AND g.review_id = ?`; params.push(review_id); }
    if (status) { query += ` AND g.status = ?`; params.push(status); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  async getGoalById(id) {
    const [rows] = await pool.execute(`
      SELECT g.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name
      FROM performance_goals g
      JOIN employees e ON g.employee_id = e.id
      WHERE g.id = ? AND g.is_deleted = 0
    `, [id]);
    return rows[0];
  }

  async createGoal(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO performance_goals (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return result.insertId;
  }

  async updateGoal(id, data) {
    const fields = Object.keys(data);
    const updates = fields.map(f => `${f} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const [result] = await pool.execute(`UPDATE performance_goals SET ${updates} WHERE id = ?`, values);
    return result.affectedRows;
  }

  async deleteGoal(id) {
    const [result] = await pool.execute(`UPDATE performance_goals SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]);
    return result.affectedRows;
  }
}

export default new PerformanceModel();
