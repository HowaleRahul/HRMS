import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, UserCheck, UserX, AlertCircle, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import { attendanceAPI, departmentAPI, employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './AttendanceList.module.css';

const AttendanceList = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    department: '',
    status: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [markData, setMarkData] = useState({ employee_id: '', date: filters.date, status: 'present', check_in: '', check_out: '' });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, statsRes, deptRes] = await Promise.all([
        attendanceAPI.getAll(filters),
        attendanceAPI.getTodayStats(),
        departmentAPI.getAll()
      ]);
      setAttendance(attRes.data?.data || []);
      setStats(statsRes.data?.data || { present: 0, absent: 0, late: 0, onLeave: 0 });
      setDepartments(deptRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const openMarkModal = async () => {
    setIsModalOpen(true);
    try {
      const res = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(res.data?.data?.employees || []);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.mark(markData);
      toast.success('Attendance marked successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleSelfCheckIn = async () => {
    try {
      await attendanceAPI.checkIn({ location: 'Office' });
      toast.success('Checked in successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check in failed');
    }
  };

  const handleSelfCheckOut = async () => {
    try {
      // Assuming check out by ID or just an endpoint
      await attendanceAPI.checkOut('self'); 
      toast.success('Checked out successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check out failed');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'Employee', key: 'employee_name', render: (row) => row.employee?.name || 'N/A' },
    { label: 'Date', key: 'date', render: (row) => new Date(row.date).toLocaleDateString() },
    { label: 'Check In', key: 'check_in', render: (row) => row.check_in || '--:--' },
    { label: 'Check Out', key: 'check_out', render: (row) => row.check_out || '--:--' },
    { label: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { label: 'Work Hours', key: 'work_hours', render: (row) => row.work_hours || '-' },
    { label: 'Late (Mins)', key: 'late_minutes', render: (row) => row.late_minutes || '-' }
  ];

  const headerActions = (
    <div className={styles.headerActions}>
      <button className="btn" onClick={handleSelfCheckIn} style={{ backgroundColor: '#10b981', color: 'white' }}>
        Check In
      </button>
      <button className="btn" onClick={handleSelfCheckOut} style={{ backgroundColor: '#ef4444', color: 'white' }}>
        Check Out
      </button>
      <button className="btn btn-primary" onClick={openMarkModal}>
        Mark Attendance
      </button>
      <button className="btn" onClick={() => navigate('/attendance/report')} style={{ backgroundColor: '#f3f4f6' }}>
        <FileText size={18} style={{ marginRight: '8px' }} /> Report
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <PageHeader title="Attendance" subtitle="Daily attendance tracking" actions={headerActions} />

      <div className={styles.statsGrid}>
        <StatCard title="Present Today" value={stats.present} icon={UserCheck} color="success" />
        <StatCard title="Absent" value={stats.absent} icon={UserX} color="danger" />
        <StatCard title="Late" value={stats.late} icon={Clock} color="warning" />
        <StatCard title="On Leave" value={stats.onLeave} icon={CalendarIcon} color="info" />
      </div>

      <div className={styles.filtersCard}>
        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="form-control" />
        <select name="department" value={filters.department} onChange={handleFilterChange} className="form-control">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
        </select>
      </div>

      <DataTable columns={columns} data={attendance} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mark Attendance">
        <form onSubmit={handleMarkAttendance} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select className="form-control" value={markData.employee_id} onChange={(e) => setMarkData({...markData, employee_id: e.target.value})} required>
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={markData.date} onChange={(e) => setMarkData({...markData, date: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={markData.status} onChange={(e) => setMarkData({...markData, status: e.target.value})}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
              <option value="late">Late</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Check In Time</label>
            <input type="time" className="form-control" value={markData.check_in} onChange={(e) => setMarkData({...markData, check_in: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Check Out Time</label>
            <input type="time" className="form-control" value={markData.check_out} onChange={(e) => setMarkData({...markData, check_out: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceList;
