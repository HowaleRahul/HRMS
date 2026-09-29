import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { leaveAPI, employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './LeaveBalance.module.css';

const LeaveBalance = () => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('self');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.getBalances(selectedEmployee);
      setBalances(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Leave Balances" 
        actions={<button className="btn" onClick={() => navigate('/leaves')} style={{ backgroundColor: '#f3f4f6' }}><ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back</button>} 
      />

      <div className={styles.filtersCard}>
        <div className="form-group" style={{ marginBottom: 0, width: '300px' }}>
          <label className="form-label">Employee</label>
          <select 
            className="form-control" 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="self">My Balances</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.balanceGrid}>
        {loading ? <div>Loading...</div> : balances.length === 0 ? <div>No balances found.</div> : (
          balances.map(bal => {
            const percentage = Math.min((bal.used / bal.total) * 100, 100);
            return (
              <div key={bal.leave_type_id} className={styles.balanceCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.typeTitle}>{bal.leave_type_name || 'Leave'}</h3>
                  <div className={styles.totalBadge}>{bal.total} Total</div>
                </div>
                
                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Used</span>
                    <span className={styles.statValue}>{bal.used}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Remaining</span>
                    <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>{bal.remaining}</span>
                  </div>
                </div>

                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: percentage > 80 ? 'var(--color-danger)' : percentage > 50 ? 'var(--color-warning)' : 'var(--color-success)'
                      }}
                    ></div>
                  </div>
                  <div className={styles.progressLabel}>{percentage.toFixed(0)}% Used</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeaveBalance;
