import { validationResult } from 'express-validator';
import AttendanceModel from '../models/attendance.model.js';
import pool from '../config/db.js';

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':');
  return new Date(2000, 0, 1, hours, minutes);
};

export const getAllAttendance = async (req, res) => {
  try {
    const filters = {
      employee_id: req.query.employee_id,
      department_id: req.query.department_id,
      date: req.query.date,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const attendance = await AttendanceModel.getAll(filters);
    const total = await AttendanceModel.getCount(filters);

    res.status(200).json({ success: true, data: attendance, pagination: { total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const att = await AttendanceModel.getById(req.params.id);
    if (!att) return res.status(404).json({ success: false, message: 'Not found' });
    const isHrAdmin = req.user.role?.name?.toLowerCase().includes('admin');
    if (Number(att.employee_id) !== Number(req.user.employee_id) && !isHrAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.status(200).json({ success: true, data: att });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const checkIn = async (req, res) => {
  try {
    const employee_id = req.user.employee_id;
    if (!employee_id) return res.status(400).json({ success: false, message: 'No employee linked to user' });

    const date = new Date().toISOString().split('T')[0];
    const check_in_time = new Date().toTimeString().split(' ')[0];

    // FIX: Check if already checked in today
    const [existing] = await pool.execute('SELECT id FROM attendance WHERE employee_id = ? AND date = ? AND is_deleted = 0', [employee_id, date]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already checked in for today' });
    }

    const settings = await AttendanceModel.getAttendanceSettings();
    let late_minutes = 0;
    let status = 'present';

    if (settings && settings.office_start_time) {
      const startObj = parseTime(settings.office_start_time);
      const actualObj = parseTime(check_in_time);
      const diffMs = actualObj - startObj;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > settings.late_threshold_minutes) {
        late_minutes = diffMins;
        status = 'late';
      }
    }

    const id = await AttendanceModel.checkIn({ employee_id, date, check_in: check_in_time, status, late_minutes });
    res.status(200).json({ success: true, message: 'Checked in successfully', data: { id, check_in: check_in_time, status, late_minutes } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const att = await AttendanceModel.getById(id);
    if (!att) return res.status(404).json({ success: false, message: 'Not found' });
    
    // FIX: IDOR vulnerability - Ensure user owns the attendance record unless they are HR/Admin
    if (att.employee_id !== req.user.employee_id && !req.user.role?.name?.toLowerCase().includes('admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot checkout for another employee' });
    }

    if (att.check_out) {
      return res.status(400).json({ success: false, message: 'Already checked out' });
    }

    const check_out_time = new Date().toTimeString().split(' ')[0];
    const settings = await AttendanceModel.getAttendanceSettings();

    const inObj = parseTime(att.check_in);
    const outObj = parseTime(check_out_time);
    let diffMins = 0;
    if (inObj && outObj) {
      diffMins = Math.floor((outObj - inObj) / 60000);
    }
    const work_hours = diffMins > 0 ? (diffMins / 60).toFixed(2) : 0;

    let overtime_hours = 0;
    let early_leaving_minutes = 0;

    if (settings && settings.office_end_time) {
      const endObj = parseTime(settings.office_end_time);
      if (outObj < endObj) {
        early_leaving_minutes = Math.floor((endObj - outObj) / 60000);
      } else {
        const extraMins = Math.floor((outObj - endObj) / 60000);
        if (extraMins > settings.overtime_threshold_minutes) {
          overtime_hours = (extraMins / 60).toFixed(2);
        }
      }
    }

    await AttendanceModel.checkOut(id, { check_out: check_out_time, work_hours, overtime_hours, early_leaving_minutes });
    res.status(200).json({ success: true, message: 'Checked out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const markAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const id = await AttendanceModel.markAttendance(req.body);
    res.status(200).json({ success: true, message: 'Attendance marked', data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const bulkMarkAttendance = async (req, res) => {
  if (!Array.isArray(req.body.records) || req.body.records.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid records array' });
  }
  try {
    const count = await AttendanceModel.bulkMarkAttendance(req.body.records);
    res.status(200).json({ success: true, message: `Successfully marked attendance for ${count} records` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { employee_id, month, year } = req.query;
    if (!employee_id || !month || !year) return res.status(400).json({ success: false, message: 'employee_id, month, year required' });
    
    // Non HR/Admin users can only view their own
    if (!req.user.role?.name?.toLowerCase().includes('admin') && req.user.employee_id !== parseInt(employee_id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const data = await AttendanceModel.getMonthlyReport(employee_id, month, year);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getDepartmentReport = async (req, res) => {
  try {
    const { department_id, date } = req.query;
    if (!department_id || !date) return res.status(400).json({ success: false, message: 'department_id and date required' });
    const data = await AttendanceModel.getDepartmentReport(department_id, date);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAttendanceSettings = async (req, res) => {
  try {
    const data = await AttendanceModel.getAttendanceSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateAttendanceSettings = async (req, res) => {
  try {
    await AttendanceModel.updateAttendanceSettings(req.body);
    res.status(200).json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getTodayStats = async (req, res) => {
  try {
    const data = await AttendanceModel.getTodayStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
