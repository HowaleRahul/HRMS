import crypto from 'crypto';

export const generateEmployeeCode = (lastCode) => {
  if (!lastCode) return 'EMP001';
  const numMatch = lastCode.match(/\d+$/);
  if (!numMatch) return 'EMP001';
  const num = parseInt(numMatch[0], 10) + 1;
  return `EMP${num.toString().padStart(3, '0')}`;
};

export const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateRandomPassword = (length = 8) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diffMs = new Date(checkOut) - new Date(checkIn);
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > 0 ? Number(diffHours.toFixed(2)) : 0;
};

export const paginate = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const offset = (parsedPage - 1) * parsedLimit;
  return { limit: parsedLimit, offset };
};
