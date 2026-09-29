import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Eye, Download, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentAPI, employeeAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import styles from './DocumentList.module.css';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  
  // Modal form state
  const [formData, setFormData] = useState({
    employee_id: '',
    document_type_id: '',
    title: '',
    document_number: '',
    expiry_date: '',
    remarks: '',
    file: null
  });

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, [filterEmployee]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentAPI.getAll({ employee_id: filterEmployee });
      setDocuments(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleVerify = async (id) => {
    try {
      if (window.confirm('Mark this document as verified?')) {
        await documentAPI.verify(id);
        toast.success('Document verified');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to verify document');
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this document?')) {
        await documentAPI.delete(id);
        toast.success('Document deleted');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      await documentAPI.upload(data);
      toast.success('Document uploaded successfully');
      setIsModalOpen(false);
      fetchDocuments();
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const columns = [
    { key: 'employee', label: 'Employee', render: (row) => `${row.first_name} ${row.last_name}` },
    { key: 'document_type', label: 'Type', render: (row) => row.type_name },
    { key: 'title', label: 'Title' },
    { key: 'document_number', label: 'Doc Number' },
    { key: 'is_verified', label: 'Status', render: (row) => (
      row.is_verified ? <CheckCircle className={styles.verifiedIcon} size={18} /> : <Clock className={styles.pendingIcon} size={18} />
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className={styles.actions}>
        <a href={row.file_url} target="_blank" rel="noreferrer" title="View/Download"><Download size={18} /></a>
        {!row.is_verified && <button onClick={() => handleVerify(row.id)} title="Verify"><CheckCircle size={18} /></button>}
        <button onClick={() => handleDelete(row.id)} className={styles.deleteBtn} title="Delete"><Trash2 size={18} /></button>
      </div>
    )}
  ];

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Documents" 
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Upload Document
          </Button>
        }
      />

      <div className={styles.filters}>
        <Select 
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          options={[{value:'', label:'All Employees'}, ...employees.map(e => ({value: e.id, label: `${e.first_name} ${e.last_name}`}))]}
        />
      </div>

      <DataTable 
        columns={columns}
        data={documents}
        loading={loading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Select 
            label="Employee"
            value={formData.employee_id}
            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
            options={employees.map(e => ({value: e.id, label: `${e.first_name} ${e.last_name}`}))}
            required
          />
          <Input 
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <Input 
            label="Document Number"
            value={formData.document_number}
            onChange={(e) => setFormData({...formData, document_number: e.target.value})}
          />
          <Input 
            type="date"
            label="Expiry Date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
          />
          <Input 
            type="file"
            label="File"
            onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
            required
          />
          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
