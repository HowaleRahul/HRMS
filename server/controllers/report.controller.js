import * as ReportModel from '../models/report.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateReportPDF } from '../utils/pdfGenerator.js';

export const getEmployeeReport = async (req, res) => {
  try {
    const data = await ReportModel.getEmployeeReport(req.query);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const data = await ReportModel.getAttendanceReport(req.query);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getLeaveReport = async (req, res) => {
  try {
    const data = await ReportModel.getLeaveReport(req.query);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getPayrollReport = async (req, res) => {
  try {
    const data = await ReportModel.getPayrollReport(req.query);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getDepartmentReport = async (req, res) => {
  try {
    const data = await ReportModel.getDepartmentReport();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getJoiningExitReport = async (req, res) => {
  try {
    const data = await ReportModel.getJoiningExitReport(req.query);
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const exportReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { format } = req.query;
    
    let data = [];
    let headers = [];
    let title = '';

    switch (type) {
      case 'employees':
        data = await ReportModel.getEmployeeReport(req.query);
        headers = ['Code', 'First Name', 'Last Name', 'Department', 'Joining Date', 'Status'];
        title = 'Employee Report';
        data = data.map(d => [d.employee_code, d.first_name, d.last_name, d.department || 'N/A', d.joining_date, d.is_active ? 'Active' : 'Inactive']);
        break;
      case 'attendance':
        data = await ReportModel.getAttendanceReport(req.query);
        headers = ['Date', 'Employee', 'Department', 'Check In', 'Check Out', 'Status'];
        title = 'Attendance Report';
        data = data.map(d => [d.date, d.first_name + ' ' + d.last_name, d.department || 'N/A', d.check_in, d.check_out, d.status]);
        break;
      case 'leaves':
        data = await ReportModel.getLeaveReport(req.query);
        headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status'];
        title = 'Leave Report';
        data = data.map(d => [d.first_name + ' ' + d.last_name, d.leave_type, d.start_date, d.end_date, d.total_days, d.status]);
        break;
      case 'payroll':
        data = await ReportModel.getPayrollReport(req.query);
        headers = ['Employee', 'Month', 'Year', 'Net Salary', 'Status'];
        title = 'Payroll Report';
        data = data.map(d => [d.first_name + ' ' + d.last_name, d.month, d.year, d.net_salary, d.payment_status]);
        break;
      default:
        return errorResponse(res, 'Invalid report type', 400);
    }

    if (format === 'csv') {
      let csvStr = headers.join(',') + '\n';
      data.forEach(row => {
        csvStr += row.map(cell => {
          let strCell = String(cell).replace(/"/g, '""');
          if (/^[=+\-@]/.test(strCell)) {
            strCell = "'" + strCell;
          }
          return '"' + strCell + '"';
        }).join(',') + '\n';
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + type + '_report.csv');
      return res.send(csvStr);
    } else if (format === 'pdf') {
      const pdfBuffer = await generateReportPDF(title, headers, data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=' + type + '_report.pdf');
      return res.send(pdfBuffer);
    }

    return errorResponse(res, 'Format must be csv or pdf', 400);
  } catch (error) {
    return errorResponse(res, 'Export failed: ' + error.message);
  }
};
