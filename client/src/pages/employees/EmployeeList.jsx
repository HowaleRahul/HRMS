import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { employeeAPI, departmentAPI, designationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './EmployeeList.module.css';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', designation: '', status: '' });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Delete Confirmation
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, filters, searchTerm]);

  const fetchMasterData = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        departmentAPI.getAll(),
        designationAPI.getAll()
      ]);
      setDepartments(deptRes.data?.data || []);
      setDesignations(desigRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        ...filters
      };
      // Mocked for now, will connect to API
      const response = await employeeAPI.getAll(params);
      setEmployees(response.data?.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await employeeAPI.delete(deleteDialog.id);
      toast.success('Employee deleted successfully');
      setDeleteDialog({ isOpen: false, id: null, isLoading: false });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
      setDeleteDialog({ isOpen: false, id: null, isLoading: false });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const columns = [
    { label: 'Code', key: 'employee_code', sortable: true },
    { 
      label: 'Employee', 
      key: 'name',
      render: (row) => (
        <div className={styles.employeeCell}>
          <div className={styles.avatar}>
            {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
          </div>
          <div>
            <div className={styles.empName}>{row.first_name} {row.last_name}</div>
            <div className={styles.empEmail}>{row.email}</div>
          </div>
        </div>
      )
    },
    { label: 'Department', key: 'department_name', render: (row) => row.department?.name || 'N/A' },
    { label: 'Designation', key: 'designation_title', render: (row) => row.designation?.title || 'N/A' },
    { 
      label: 'Status', 
      key: 'status',
      render: (row) => <StatusBadge status={row.status || 'active'} />
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => navigate(`/employees/${row.id}`)} title="View" aria-label="View">
            <Eye size={18} />
          </button>
          <button className={styles.iconBtn} onClick={() => navigate(`/employees/edit/${row.id}`)} title="Edit" aria-label="Edit">
            <Edit size={18} />
          </button>
          <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDeleteClick(row.id)} title="Delete" aria-label="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const headerActions = (
    <button className="btn btn-primary" onClick={() => navigate('/employees/add')}>
      <Plus size={18} style={{ marginRight: '8px' }} />
      Add Employee
    </button>
  );

  return (
    <div className={styles.container}>
      <PageHeader title="Employees" subtitle="Manage your company's workforce" actions={headerActions} />
      
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, email, or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select 
            name="department" 
            value={filters.department} 
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          
          <select 
            name="designation" 
            value={filters.designation} 
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Designations</option>
            {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={employees} 
        loading={loading}
        pagination={{ currentPage: page, totalPages, onPageChange: setPage }}
      />

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
};

export default EmployeeList;
