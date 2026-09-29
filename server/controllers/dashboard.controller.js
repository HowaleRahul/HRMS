import * as DashboardModel from '../models/dashboard.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      lateToday,
      newEmployees,
      departmentWise,
      recentActivities,
      upcomingHolidays,
      pendingLeaves,
      attendanceSummary,
      payrollSummary
    ] = await Promise.all([
      DashboardModel.getTotalEmployees(),
      DashboardModel.getPresentToday(),
      DashboardModel.getAbsentToday(),
      DashboardModel.getOnLeaveToday(),
      DashboardModel.getLateToday(),
      DashboardModel.getNewEmployees(30),
      DashboardModel.getDepartmentWiseCount(),
      DashboardModel.getRecentActivities(5),
      DashboardModel.getUpcomingHolidays(3),
      DashboardModel.getPendingLeaveRequests(),
      DashboardModel.getMonthlyAttendanceSummary(currentMonth, currentYear),
      DashboardModel.getPayrollSummary(currentMonth, currentYear)
    ]);

    const stats = {
      overview: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday,
        lateToday,
        newEmployees
      },
      charts: {
        departmentWise,
        attendanceSummary
      },
      payroll: payrollSummary,
      pending: {
        leaves: pendingLeaves
      },
      recentActivities,
      upcomingHolidays
    };

    return successResponse(res, stats);
  } catch (error) {
    logger.error('Dashboard error: ' + error.message);
    return errorResponse(res, 'Internal server error');
  }
};
