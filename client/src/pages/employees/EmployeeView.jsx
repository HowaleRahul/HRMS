import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Printer, ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './EmployeeView.module.css';

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id);
      setEmployee(response.data?.data);
    } catch (error) {
      toast.error('Failed to fetch employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!employee) return <div>Employee not found.</div>;

  const headerActions = (
    <>
      <button className="btn" onClick={() => navigate('/employees')} style={{ backgroundColor: '#f3f4f6' }}>
        <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back
      </button>
      <button className="btn" style={{ backgroundColor: '#f3f4f6' }} onClick={() => window.print()}>
        <Printer size={18} style={{ marginRight: '8px' }} /> Print
      </button>
      <button className="btn btn-primary" onClick={() => navigate(`/employees/edit/${id}`)}>
        <Edit size={18} style={{ marginRight: '8px' }} /> Edit Profile
      </button>
    </>
  );

  return (
    <div className={styles.container}>
      <PageHeader title="Employee Profile" actions={headerActions} />
      
      <div className={styles.profileHeader}>
        <div className={styles.avatarLarge}>
          {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
        </div>
        <div className={styles.basicInfo}>
          <h2>{employee.first_name} {employee.last_name}</h2>
          <div className={styles.metaData}>
            <span><Briefcase size={16}/> {employee.designation?.title || 'No Designation'}</span>
            <span><MapPin size={16}/> {employee.department?.name || 'No Department'}</span>
            <StatusBadge status={employee.status || 'active'} />
          </div>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.sidebar}>
          {['personal', 'employment', 'bank', 'salary'].map(tab => (
            <button 
              key={tab}
              className={`${styles.navItem} ${activeTab === tab ? styles.activeNav : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <div className={styles.details}>
          {activeTab === 'personal' && (
            <div className={styles.section}>
              <h3>Personal Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Email</label>
                  <p><Mail size={14}/> {employee.email}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Phone</label>
                  <p><Phone size={14}/> {employee.phone || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Date of Birth</label>
                  <p><Calendar size={14}/> {employee.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Gender</label>
                  <p>{employee.gender || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          {/* Employment, Bank, Salary views follow similar pattern */}
          {activeTab === 'employment' && (
            <div className={styles.section}>
              <h3>Employment Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Employee Code</label>
                  <p>{employee.employee_code}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Employment Type</label>
                  <p>{employee.employment_type || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Joining Date</label>
                  <p>{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;
