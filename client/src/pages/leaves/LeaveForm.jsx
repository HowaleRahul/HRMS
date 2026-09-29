import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './LeaveForm.module.css';

const LeaveForm = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typeRes, balRes] = await Promise.all([
        leaveAPI.getTypes(),
        leaveAPI.getBalances('self')
      ]);
      setTypes(typeRes.data?.data || []);
      setBalances(balRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to load leave data');
    }
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (end < start) return 0;
    // Simple calculation, doesn't account for weekends/holidays
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const days = calculateDays();
    if (days <= 0) {
      toast.error('Invalid date range');
      return;
    }
    
    setLoading(true);
    try {
      await leaveAPI.apply({ ...formData, total_days: days });
      toast.success('Leave request submitted successfully');
      navigate('/leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getBalance = (typeId) => {
    const bal = balances.find(b => Number(b.leave_type_id) === Number(typeId));
    return bal ? bal.remaining : 0;
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Apply Leave" 
        actions={<button className="btn" onClick={() => navigate('/leaves')} style={{ backgroundColor: '#f3f4f6' }}><ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back</button>} 
      />

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select className="form-control" value={formData.leave_type_id} onChange={(e) => setFormData({...formData, leave_type_id: e.target.value})} required>
              <option value="">Select Leave Type</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Balance: {getBalance(t.id)} days)</option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-control" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">End Date *</label>
              <input type="date" className="form-control" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
            </div>
          </div>

          <div className={styles.summaryBox}>
            <p><strong>Total Days:</strong> {calculateDays()}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Reason *</label>
            <textarea className="form-control" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required rows="4" placeholder="Please provide a reason for your leave..."></textarea>
          </div>

          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} style={{ marginRight: '8px' }} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
