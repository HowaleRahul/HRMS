export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  EMPLOYEES: '/employees',
  DEPARTMENTS: '/departments',
  // ... other endpoints
};

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  HR_ADMIN: 'HR Admin',
  EMPLOYEE: 'Employee'
};

export const STATUS_COLORS = {
  active: 'success',
  inactive: 'danger',
  present: 'success',
  absent: 'danger',
  leave: 'warning',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger'
};

export const DATE_FORMAT = 'MMM DD, YYYY';
export const TIME_FORMAT = 'hh:mm A';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
};
