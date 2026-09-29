import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { attendanceAPI, employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './AttendanceReport.module.css';

const AttendanceReport = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, half_day: 0, late: 0, ot_hours: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchReport();
    }
  }, [selectedEmployee, currentDate]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(res.data?.data?.employees || []);
      if (res.data?.data?.employees?.length > 0) {
        setSelectedEmployee(res.data.data.employees[0].id);
      }
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchReport = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await attendanceAPI.getMonthlyReport({ employee_id: selectedEmployee, month, year });
      
      const data = res.data?.data || {};
      const attendanceData = data.attendance || [];
      
      const formattedEvents = attendanceData.map(att => ({
        title: att.status.replace('_', ' ').toUpperCase(),
        date: att.date.split('T')[0],
        color: getColorForStatus(att.status),
        extendedProps: {
          checkIn: att.check_in,
          checkOut: att.check_out,
          workHours: att.work_hours
        }
      }));
      
      setEvents(formattedEvents);
      setSummary(data.summary || { present: 0, absent: 0, half_day: 0, late: 0, ot_hours: 0 });
    } catch (error) {
      toast.error('Failed to fetch attendance report');
    }
  };

  const getColorForStatus = (status) => {
    switch(status) {
      case 'present': return '#10b981'; // green
      case 'absent': return '#ef4444'; // red
      case 'half_day': return '#f59e0b'; // yellow
      case 'late': return '#f97316'; // orange
      case 'on_leave': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  const handleDatesSet = (dateInfo) => {
    setCurrentDate(dateInfo.view.currentStart);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className={styles.eventContent}>
        <b>{eventInfo.event.title}</b>
        {eventInfo.event.extendedProps.checkIn && (
          <div className={styles.eventTime}>
            {eventInfo.event.extendedProps.checkIn} - {eventInfo.event.extendedProps.checkOut || '?'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Attendance Report" />

      <div className={styles.filtersCard}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, maxWidth: '300px' }}>
          <label className="form-label">Select Employee</label>
          <select 
            className="form-control" 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.calendarCard}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={renderEventContent}
          datesSet={handleDatesSet}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
        />
      </div>

      <div className={styles.summaryGrid}>
        <StatCard title="Total Present" value={summary.present} color="success" />
        <StatCard title="Total Absent" value={summary.absent} color="danger" />
        <StatCard title="Half Days" value={summary.half_day} color="warning" />
        <StatCard title="Late Days" value={summary.late} color="warning" />
        <StatCard title="OT Hours" value={summary.ot_hours} color="primary" />
      </div>
    </div>
  );
};

export default AttendanceReport;
