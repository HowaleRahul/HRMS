import * as PayrollModel from '../models/payroll.model.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { paginate } from '../utils/helpers.js';
import { generatePayslipPDF as generatePDF } from '../utils/pdfGenerator.js';
import logger from '../utils/logger.js';

export const getAllPayroll = async (req, res) => {
  try {
    const { page, limit: queryLimit } = req.query;
    const { limit, offset } = paginate(page, queryLimit);
    
    const filters = { ...req.query, limit, offset };
    const payrolls = await PayrollModel.getAll(filters);
    const total = await PayrollModel.getCount(filters);
    
    return paginatedResponse(res, payrolls, total, page || 1, limit);
  } catch (error) {
    logger.error('Get payroll error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const payroll = await PayrollModel.getById(req.params.id);
    if (!payroll) return errorResponse(res, 'Payroll record not found', 404);
    return successResponse(res, payroll);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const generatePayroll = async (req, res) => {
  try {
    const { employee_id, month, year } = req.body;
    const existing = await PayrollModel.getByEmployeeMonthYear(employee_id, month, year);
    if (existing) {
      return errorResponse(res, 'Payroll already exists for this month', 400);
    }
    const id = await PayrollModel.generate(req.body);
    return successResponse(res, { id }, 'Payroll generated successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const bulkGeneratePayroll = async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !records.length) return errorResponse(res, 'No records provided', 400);
    const ids = await PayrollModel.bulkGenerate(records);
    return successResponse(res, { ids }, 'Bulk payroll generated successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updatePayroll = async (req, res) => {
  try {
    await PayrollModel.update(req.params.id, req.body);
    return successResponse(res, null, 'Payroll updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const deletePayroll = async (req, res) => {
  try {
    await PayrollModel.softDelete(req.params.id);
    return successResponse(res, null, 'Payroll deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, payment_date, transaction_ref } = req.body;
    await PayrollModel.updatePaymentStatus(req.params.id, status, payment_date, transaction_ref);
    return successResponse(res, null, 'Payment status updated successfully');
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const getMonthlyPayrollSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return errorResponse(res, 'Month and year are required', 400);
    const summary = await PayrollModel.getMonthlyPayrollSummary(month, year);
    return successResponse(res, summary);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};

export const generatePayslipPDF = async (req, res) => {
  try {
    const payroll = await PayrollModel.getById(req.params.id);
    if (!payroll) return errorResponse(res, 'Payroll record not found', 404);

    const employeeData = {
      first_name: payroll.first_name,
      last_name: payroll.last_name,
      employee_code: payroll.employee_code,
      department_name: payroll.department_name,
      designation_name: payroll.designation_name
    };

    const payrollData = {
      month: payroll.month,
      year: payroll.year,
      basic_salary: payroll.basic_salary,
      allowances: allowSum,
      deductions: dedSum,
      net_salary: payroll.net_salary
    };

    const pdfBuffer = await generatePDF(payrollData, employeeData);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=payslip_\${payroll.month}_\${payroll.year}.pdf`
    });
    return res.send(pdfBuffer);
  } catch (error) {
    logger.error('PDF generation error: ' + error.message);
    return errorResponse(res, 'Failed to generate PDF payslip');
  }
};

export const generateFromSalaryStructures = async (req, res) => {
  // Simplified implementation for all employees for a given month/year
  try {
    const { month, year, employee_id } = req.body;
    if (employee_id) {
      const id = await PayrollModel.generateFromSalaryStructure(employee_id, month, year);
      return successResponse(res, { id }, 'Payroll generated from structure');
    }
    return errorResponse(res, 'Not implemented for all employees yet. Pass employee_id.', 400);
  } catch (error) {
    return errorResponse(res, 'Internal server error');
  }
};
