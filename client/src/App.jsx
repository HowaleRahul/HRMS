import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const EmployeeList = lazy(() => import('./pages/employees/EmployeeList'));
const EmployeeForm = lazy(() => import('./pages/employees/EmployeeForm'));
const EmployeeView = lazy(() => import('./pages/employees/EmployeeView'));
const DepartmentList = lazy(() => import('./pages/departments/DepartmentList'));
const DesignationList = lazy(() => import('./pages/designations/DesignationList'));
const AttendanceList = lazy(() => import('./pages/attendance/AttendanceList'));
const AttendanceReport = lazy(() => import('./pages/attendance/AttendanceReport'));
const LeaveList = lazy(() => import('./pages/leaves/LeaveList'));
const LeaveForm = lazy(() => import('./pages/leaves/LeaveForm'));
const LeaveBalance = lazy(() => import('./pages/leaves/LeaveBalance'));
const PayrollList = lazy(() => import('./pages/payroll/PayrollList'));
const PayrollView = lazy(() => import('./pages/payroll/PayrollView'));
const RecruitmentDashboard = lazy(() => import('./pages/recruitment/RecruitmentDashboard'));
const PerformanceList = lazy(() => import('./pages/performance/PerformanceList'));
const AssetList = lazy(() => import('./pages/assets/AssetList'));

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
        <Suspense fallback={<Loader />}>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
      </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}
