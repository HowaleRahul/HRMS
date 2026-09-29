import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const originalRequest = error.config;
  if (error.response && error.response.status === 401 && originalRequest.url !== '/auth/login') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/employees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/employees/${id}`),
  updateBankDetails: (id, data) => api.put(`/employees/${id}/bank-details`, data),
  addEmergencyContact: (id, data) => api.post(`/employees/${id}/emergency-contacts`, data),
  updateEmergencyContact: (id, contactId, data) => api.put(`/employees/${id}/emergency-contacts/${contactId}`, data),
  deleteEmergencyContact: (id, contactId) => api.delete(`/employees/${id}/emergency-contacts/${contactId}`),
  updateSalary: (id, data) => api.put(`/employees/${id}/salary`, data)
};

export const departmentAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

export const designationAPI = {
  getAll: (params) => api.get('/designations', { params }),
  getById: (id) => api.get(`/designations/${id}`),
  create: (data) => api.post('/designations', data),
  update: (id, data) => api.put(`/designations/${id}`, data),
  delete: (id) => api.delete(`/designations/${id}`)
};

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getTodayStats: () => api.get('/attendance/today-stats'),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (id) => api.put(`/attendance/check-out/${id}`),
  mark: (data) => api.post('/attendance/mark', data),
  getMonthlyReport: (params) => api.get('/attendance/monthly-report', { params }),
  getSettings: () => api.get('/attendance/settings'),
  updateSettings: (data) => api.put('/attendance/settings', data)
};

export const leaveAPI = {
  getTypes: () => api.get('/leaves/types'),
  getBalances: (empId) => api.get(`/leaves/balances/${empId}`),
  getRequests: (params) => api.get('/leaves/requests', { params }),
  getTeamRequests: (params) => api.get('/leaves/requests/team', { params }),
  getRequestById: (id) => api.get(`/leaves/requests/${id}`),
  apply: (data) => api.post('/leaves/requests', data),
  approve: (id) => api.put(`/leaves/requests/${id}/approve`),
  reject: (id, data) => api.put(`/leaves/requests/${id}/reject`, data),
  cancel: (id) => api.put(`/leaves/requests/${id}/cancel`)
};

export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  generate: (data) => api.post('/payroll/generate', data),
  bulkGenerate: (data) => api.post('/payroll/bulk-generate', data),
  update: (id, data) => api.put(`/payroll/${id}`, data),
  updateStatus: (id, data) => api.put(`/payroll/${id}/status`, data),
  delete: (id) => api.delete(`/payroll/${id}`),
  getPayslip: (id) => api.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
  getSummary: (params) => api.get('/payroll/summary', { params })
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getRoles: () => api.get('/users/roles'),
  getRoleById: (id) => api.get(`/users/roles/${id}`),
  getPermissions: () => api.get('/users/permissions'),
  getRolePermissions: (id) => api.get(`/users/roles/${id}/permissions`),
  updateRolePermissions: (id, data) => api.put(`/users/roles/${id}/permissions`, data)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard')
};

export const recruitmentAPI = {
  getJobOpenings: (params) => api.get('/recruitment/jobs', { params }),
  getJobById: (id) => api.get(`/recruitment/jobs/${id}`),
  createJob: (data) => api.post('/recruitment/jobs', data),
  updateJob: (id, data) => api.put(`/recruitment/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruitment/jobs/${id}`),
  getCandidates: (params) => api.get('/recruitment/candidates', { params }),
  getCandidateById: (id) => api.get(`/recruitment/candidates/${id}`),
  createCandidate: (data) => api.post('/recruitment/candidates', data),
  updateCandidate: (id, data) => api.put(`/recruitment/candidates/${id}`, data),
  getApplications: (params) => api.get('/recruitment/applications', { params }),
  createApplication: (data) => api.post('/recruitment/applications', data),
  updateApplicationStatus: (id, data) => api.put(`/recruitment/applications/${id}/status`, data),
  getInterviews: (params) => api.get('/recruitment/interviews', { params }),
  createInterview: (data) => api.post('/recruitment/interviews', data),
  updateInterview: (id, data) => api.put(`/recruitment/interviews/${id}`, data)
};

export const performanceAPI = {
  getReviews: (params) => api.get('/performance/reviews', { params }),
  getReviewById: (id) => api.get(`/performance/reviews/${id}`),
  createReview: (data) => api.post('/performance/reviews', data),
  updateReview: (id, data) => api.put(`/performance/reviews/${id}`, data),
  getGoals: (params) => api.get('/performance/goals', { params }),
  createGoal: (data) => api.post('/performance/goals', data),
  updateGoal: (id, data) => api.put(`/performance/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/performance/goals/${id}`)
};

export const assetAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  assign: (data) => api.post('/assets/assign', data),
  returnAsset: (id, data) => api.put(`/assets/assignments/${id}/return`, data),
  getAssignments: (params) => api.get('/assets/assignments', { params })
};

export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (data) => api.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/documents/${id}`),
  verify: (id) => api.put(`/documents/${id}/verify`)
};

export const noticeAPI = {
  getAll: (params) => api.get('/notices', { params }),
  getById: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`)
};

export const holidayAPI = {
  getAll: (params) => api.get('/holidays', { params }),
  create: (data) => api.post('/holidays', data),
  update: (id, data) => api.put(`/holidays/${id}`, data),
  delete: (id) => api.delete(`/holidays/${id}`)
};

export const reportAPI = {
  getEmployeeReport: (params) => api.get('/reports/employees', { params }),
  getAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  getLeaveReport: (params) => api.get('/reports/leaves', { params }),
  getPayrollReport: (params) => api.get('/reports/payroll', { params }),
  getDepartmentReport: (params) => api.get('/reports/departments', { params }),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' })
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count')
};

export default api;
