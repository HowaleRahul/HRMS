import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { designationAPI, departmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './DesignationList.module.css';

const DesignationList = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', level: '', department_id: '', description: '', status: 'active'
  });

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, [searchTerm]);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await designationAPI.getAll({ search: searchTerm });
      setDesignations(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const openModal = (desig = null) => {
    if (desig) {
      setEditingId(desig.id);
      setFormData({
        title: desig.title || '',
        level: desig.level || '',
        department_id: desig.department_id || '',
        description: desig.description || '',
        status: desig.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', level: '', department_id: '', description: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, isSubmitting: true }));
    try {
      if (editingId) {
        await designationAPI.update(editingId, formData);
        toast.success('Designation updated successfully');
      } else {
        await designationAPI.create(formData);
        toast.success('Designation created successfully');
      }
      setIsModalOpen(false);
      fetchDesignations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFormData(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const confirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await designationAPI.delete(deleteDialog.id);
      toast.success('Designation deleted successfully');
      fetchDesignations();
    } catch (error) {
      toast.error('Failed to delete designation');
    } finally {
      setDeleteDialog({ isOpen: false, id: null, isLoading: false });
    }
  };

  const columns = [
    { label: 'Title', key: 'title', sortable: true },
    { label: 'Level', key: 'level' },
    { label: 'Department', key: 'department_name', render: (row) => row.department?.name || 'N/A' },
    { label: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openModal(row)} title="Edit" aria-label="Edit"><Edit size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => setDeleteDialog({ isOpen: true, id: row.id })} title="Delete" aria-label="Delete"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Designations" 
        actions={<button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Add Designation</button>} 
      />
      
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search designations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-control" />
        </div>
      </div>

      <DataTable columns={columns} data={designations} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => !formData.isSubmitting && setIsModalOpen(false)} title={editingId ? 'Edit Designation' : 'Add Designation'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className="form-control" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Level (Numeric)</label>
            <input type="number" className="form-control" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-control" value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Active Status</label>
            <input type="checkbox" checked={formData.status === 'active'} onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)} disabled={formData.isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formData.isSubmitting}>
              {formData.isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })} 
        onConfirm={confirmDelete} 
        title="Delete Designation" 
        message="Are you sure you want to delete this designation?" 
        type="danger" 
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
};

export default DesignationList;
