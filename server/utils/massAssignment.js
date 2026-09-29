import pool from './config/db.js';

const tableColumnsCache = {};

export const getTableColumns = async (tableName) => {
  if (tableColumnsCache[tableName]) {
    return tableColumnsCache[tableName];
  }
  
  try {
    const [rows] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = ?
    `, [tableName]);
    
    const columns = rows.map(r => r.COLUMN_NAME);
    tableColumnsCache[tableName] = columns;
    return columns;
  } catch (err) {
    console.error('Error fetching columns for', tableName, err);
    return [];
  }
};

export const sanitizeData = async (tableName, data) => {
  const allowed = await getTableColumns(tableName);
  if (allowed.length === 0) return data; // Fallback if schema fetch fails
  
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
