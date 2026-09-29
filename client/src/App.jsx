import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Employees
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeView from './pages/employees/EmployeeView';

// Departments & Designations
import DepartmentList from './pages/departments/DepartmentList';
import DesignationList from './pages/designations/DesignationList';

// Attendance
import AttendanceList from './pages/attendance/AttendanceList';
import AttendanceReport from './pages/attendance/AttendanceReport';

// Leave Management
import LeaveList from './pages/leaves/LeaveList';
import LeaveForm from './pages/leaves/LeaveForm';
import LeaveBalance from './pages/leaves/LeaveBalance';

// Payroll
import PayrollList from './pages/payroll/PayrollList';
import PayrollView from './pages/payroll/PayrollView';

// Recruitment
import RecruitmentDashboard from './pages/recruitment/RecruitmentDashboard';

// Performance
import PerformanceList from './pages/performance/PerformanceList';

// Assets
import AssetList from './pages/assets/AssetList';

// Documents
const DocumentList = lazy(() => import('./pages/documents/DocumentList'));

// Notices
const NoticeList = lazy(() => import('./pages/notices/NoticeList'));

// Holidays
const HolidayList = lazy(() => import('./pages/holidays/HolidayList'));

// Reports
const ReportsDashboard = lazy(() => import('./pages/reports/ReportsDashboard'));

// Settings
const UserList = lazy(() => import('./pages/settings/UserList'));
const RolePermissions = lazy(() => import('./pages/settings/RolePermissions'));

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Employee Routes */}
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<EmployeeForm />} />
          <Route path="employees/edit/:id" element={<EmployeeForm />} />
          <Route path="employees/:id" element={<EmployeeView />} />

          {/* Department & Designation Routes */}
          <Route path="departments" element={<DepartmentList />} />
          <Route path="designations" element={<DesignationList />} />

          {/* Attendance Routes */}
          <Route path="attendance" element={<AttendanceList />} />
          <Route path="attendance/report" element={<AttendanceReport />} />

          {/* Leave Routes */}
          <Route path="leaves" element={<LeaveList />} />
          <Route path="leaves/apply" element={<LeaveForm />} />
          <Route path="leaves/balances" element={<LeaveBalance />} />

          {/* Payroll Routes */}
          <Route path="payroll" element={<PayrollList />} />
          <Route path="payroll/:id" element={<PayrollView />} />

          {/* Recruitment Routes */}
          <Route path="recruitment" element={<RecruitmentDashboard />} />

          {/* Performance Routes */}
          <Route path="performance" element={<PerformanceList />} />

          {/* Asset Routes */}
          <Route path="assets" element={<AssetList />} />

          {/* Documents Route */}
          <Route path="documents" element={
            <Suspense fallback={<Loader />}>
              <DocumentList />
            </Suspense>
          } />

          {/* Notices Route */}
          <Route path="notices" element={
            <Suspense fallback={<Loader />}>
              <NoticeList />
            </Suspense>
          } />

          {/* Holidays Route */}
          <Route path="holidays" element={
            <Suspense fallback={<Loader />}>
              <HolidayList />
            </Suspense>
          } />

          {/* Reports Route */}
          <Route path="reports" element={
            <Suspense fallback={<Loader />}>
              <ReportsDashboard />
            </Suspense>
          } />

          {/* Settings Routes */}
          <Route path="settings/users" element={
            <Suspense fallback={<Loader />}>
              <UserList />
            </Suspense>
          } />
          <Route path="settings/roles" element={
            <Suspense fallback={<Loader />}>
              <RolePermissions />
            </Suspense>
          } />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
