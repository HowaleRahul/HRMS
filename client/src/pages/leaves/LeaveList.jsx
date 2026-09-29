import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { leaveAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './LeaveList.module.css';
import useAuth from '../../hooks/useAuth';

const LeaveList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my_leaves'); // my_leaves, team_leaves, all_leaves
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '', start: '', end: '' });
  
  const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null, reason: '' });

  useEffect(() => {
    fetchLeaves();
  }, [activeTab, filters]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'my_leaves') {
        res = await leaveAPI.getRequests({ ...filters, employee_id: user?.id || 'self' });
      } else if (activeTab === 'team_leaves') {
        res = await leaveAPI.getTeamRequests(filters);
      } else {
        res = await leaveAPI.getRequests(filters);
      }
      setLeaves(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveAPI.approve(id);
      toast.success('Leave request approved');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.reject(rejectModal.id, { reason: rejectModal.reason });
      toast.success('Leave request rejected');
      setRejectModal({ isOpen: false, id: null, reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleCancel = async (id) => {
    try {
      await leaveAPI.cancel(id);
      toast.success('Leave request cancelled');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'Employee', key: 'employee_name', render: (row) => row.employee?.name || 'N/A' },
    { label: 'Type', key: 'leave_type', render: (row) => row.leave_type?.name || 'N/A' },
    { label: 'From', key: 'start_date', render: (row) => new Date(row.start_date).toLocaleDateString() },
    { label: 'To', key: 'end_date', render: (row) => new Date(row.end_date).toLocaleDateString() },
    { label: 'Days', key: 'total_days' },
    { label: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { label: 'Applied On', key: 'created_at', render: (row) => new Date(row.created_at).toLocaleDateString() },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className={styles.actions}>
          {activeTab === 'my_leaves' && row.status === 'pending' && (
            <button className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleCancel(row.id)}>Cancel</button>
          )}
          {(activeTab === 'team_leaves' || activeTab === 'all_leaves') && row.status === 'pending' && (
            <>
              <button className={styles.iconBtn} style={{ color: '#10b981' }} onClick={() => handleApprove(row.id)} title="Approve"><CheckCircle size={18} /></button>
              <button className={styles.iconBtn} style={{ color: '#ef4444' }} onClick={() => setRejectModal({ isOpen: true, id: row.id, reason: '' })} title="Reject"><XCircle size={18} /></button>
            </>
          )}
        </div>
      )
    }
  ];

  const headerActions = (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button className="btn" style={{ backgroundColor: '#f3f4f6' }} onClick={() => navigate('/leaves/balances')}>
        View Balances
      </button>
      <button className="btn btn-primary" onClick={() => navigate('/leaves/add')}>
        <Plus size={18} style={{ marginRight: '8px' }} /> Apply Leave
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <PageHeader title="Leave Management" actions={headerActions} />

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'my_leaves' ? styles.activeTab : ''}`} onClick={() => setActiveTab('my_leaves')}>My Leaves</button>
        <button className={`${styles.tab} ${activeTab === 'team_leaves' ? styles.activeTab : ''}`} onClick={() => setActiveTab('team_leaves')}>Team Leaves</button>
        <button className={`${styles.tab} ${activeTab === 'all_leaves' ? styles.activeTab : ''}`} onClick={() => setActiveTab('all_leaves')}>All Leaves</button>
      </div>

      <div className={styles.filtersCard}>
        <select name="type" value={filters.type} onChange={handleFilterChange} className="form-control">
          <option value="">All Types</option>
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="casual">Casual Leave</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={leaves} loading={loading} />

      <Modal isOpen={rejectModal.isOpen} onClose={() => setRejectModal({ isOpen: false, id: null, reason: '' })} title="Reject Leave Request">
        <form onSubmit={handleReject} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Reason for rejection</label>
            <textarea className="form-control" value={rejectModal.reason} onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})} required rows="3"></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn" onClick={() => setRejectModal({ isOpen: false, id: null, reason: '' })}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#ef4444' }}>Reject Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveList;
