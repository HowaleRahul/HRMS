import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { Users, UserCheck, UserX, Calendar as CalendarIcon, Clock, UserPlus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { dashboardAPI } from '../../services/api';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Try to fetch stats, if it fails use mock data for UI visualization
      const res = await dashboardAPI.getStats();
      setStats(res.data?.data);
    } catch (error) {
      console.log('Using mock dashboard data for preview');
      setStats({
        totalEmployees: 142,
        presentToday: 120,
        absentToday: 5,
        onLeaveToday: 7,
        lateToday: 10,
        newJoiners: 3,
        departments: [
          { name: 'Engineering', count: 45, color: '#4f46e5' },
          { name: 'Sales', count: 30, color: '#10b981' },
          { name: 'Marketing', count: 20, color: '#f59e0b' },
          { name: 'HR', count: 12, color: '#ec4899' },
          { name: 'Finance', count: 15, color: '#8b5cf6' }
        ],
        recentActivities: [
          { id: 1, action: 'Leave approved for John Doe', time: '10 mins ago', type: 'leave' },
          { id: 2, action: 'New employee Jane Smith joined', time: '1 hour ago', type: 'employee' },
          { id: 3, action: 'Payroll processed for August', time: '3 hours ago', type: 'payroll' }
        ],
        upcomingHolidays: [
          { id: 1, name: 'Independence Day', date: '2026-10-15' },
          { id: 2, name: 'Diwali', date: '2026-11-12' }
        ],
        pendingLeaves: 8
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  const maxDeptCount = Math.max(...(stats.departments?.map(d => d.count) || [1]));

  return (
    <div className={styles.container}>
      <PageHeader 
        title={`Welcome back, ${user?.name || 'Admin'}!`} 
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
      />
      
      <div className={styles.statsGrid}>
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="info" />
        <StatCard title="Present Today" value={stats.presentToday} icon={UserCheck} color="success" />
        <StatCard title="Absent Today" value={stats.absentToday} icon={UserX} color="danger" />
        <StatCard title="On Leave" value={stats.onLeaveToday} icon={CalendarIcon} color="warning" />
        <StatCard title="Late Today" value={stats.lateToday} icon={Clock} color="warning" />
        <StatCard title="New Joiners" value={stats.newJoiners} icon={UserPlus} color="primary" />
      </div>

      <div className={styles.mainRow}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Department Wise Employees</h3>
            <div className={styles.deptChart}>
              {stats.departments?.map((dept, index) => (
                <div key={index} className={styles.deptBarWrapper}>
                  <div className={styles.deptLabel}>
                    <span>{dept.name}</span>
                    <span>{dept.count}</span>
                  </div>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.barFill} 
                      style={{ 
                        width: `${(dept.count / maxDeptCount) * 100}%`,
                        backgroundColor: dept.color || 'var(--color-primary)' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Recent Activities</h3>
            <ul className={styles.activityList}>
              {stats.recentActivities?.map(act => (
                <li key={act.id} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityContent}>
                    <p>{act.action}</p>
                    <span>{act.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quick Actions</h3>
            <div className={styles.quickActions}>
              <button className={styles.actionBtn} onClick={() => navigate('/employees/add')}>
                <UserPlus size={20} /> Add Employee
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/attendance')}>
                <Clock size={20} /> Mark Attendance
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/leaves/apply')}>
                <CalendarIcon size={20} /> Apply Leave
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Pending Leave Requests</h3>
            <div className={styles.pendingLeavesCard}>
              <div className={styles.pendingCount}>{stats.pendingLeaves || 0}</div>
              <p>Requests waiting for your approval</p>
              <button className="btn btn-primary" onClick={() => navigate('/leaves')} style={{ marginTop: '10px' }}>Review Leaves</button>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Upcoming Holidays</h3>
            <ul className={styles.holidayList}>
              {stats.upcomingHolidays?.map(holiday => (
                <li key={holiday.id} className={styles.holidayItem}>
                  <div className={styles.holidayDate}>
                    <span>{new Date(holiday.date).getDate()}</span>
                    <span>{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className={styles.holidayName}>{holiday.name}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
