import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { departmentAPI, employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './DepartmentList.module.css';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', head_id: '', parent_id: '', status: 'active'
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [searchTerm, statusFilter]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = { search: searchTerm, status: statusFilter };
      const res = await departmentAPI.getAll(params);
      setDepartments(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll({ limit: 1000 });
      setEmployees(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingId(dept.id);
      setFormData({
        name: dept.name || '',
        code: dept.code || '',
        description: dept.description || '',
        head_id: dept.head_id || '',
        parent_id: dept.parent_id || '',
        status: dept.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', code: '', description: '', head_id: '', parent_id: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, isSubmitting: true }));
    try {
      if (editingId) {
        await departmentAPI.update(editingId, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.create(formData);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFormData(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const confirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await departmentAPI.delete(deleteDialog.id);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    } finally {
      setDeleteDialog({ isOpen: false, id: null, isLoading: false });
    }
  };

  const columns = [
    { label: 'Code', key: 'code', sortable: true },
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Head', key: 'head_name', render: (row) => row.head?.name || 'N/A' },
    { label: 'Parent Dept', key: 'parent_name', render: (row) => row.parent?.name || 'N/A' },
    { label: 'Employees', key: 'employee_count' },
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
        title="Departments" 
        actions={<button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Add Department</button>} 
      />
      
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-control" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control" style={{ width: '200px' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} data={departments} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => !formData.isSubmitting && setIsModalOpen(false)} title={editingId ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Code * (Max 10 chars)</label>
            <input type="text" className="form-control" maxLength="10" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Head Employee</label>
            <select className="form-control" value={formData.head_id} onChange={(e) => setFormData({...formData, head_id: e.target.value})}>
              <option value="">Select Head</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Parent Department</label>
            <select className="form-control" value={formData.parent_id} onChange={(e) => setFormData({...formData, parent_id: e.target.value})}>
              <option value="">Select Parent</option>
              {departments.filter(d => d.id !== editingId).map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
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
        title="Delete Department" 
        message="Are you sure you want to delete this department?" 
        type="danger" 
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
};

export default DepartmentList;
