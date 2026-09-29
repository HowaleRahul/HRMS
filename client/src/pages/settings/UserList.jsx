import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI, employeeAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import styles from './UserList.module.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    employee_id: '',
    is_active: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, rRes, eRes] = await Promise.all([
        userAPI.getAll(),
        userAPI.getRoles(),
        employeeAPI.getAll()
      ]);
      setUsers(uRes.data?.data || []);
      setRoles(rRes.data?.data || []);
      setEmployees(eRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        const data = { ...formData };
        if (!data.password) delete data.password;
        await userAPI.update(currentUser.id, data);
        toast.success('User updated');
      } else {
        await userAPI.create(formData);
        toast.success('User created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await userAPI.delete(id);
        toast.success('User deleted');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role_id: user.role_id,
        employee_id: user.employee_id || '',
        is_active: user.is_active
      });
    } else {
      setCurrentUser(null);
      setFormData({ username: '', email: '', password: '', role_id: '', employee_id: '', is_active: 1 });
    }
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role_name', label: 'Role', render: (row) => row.role_display_name || row.role_name },
    { key: 'employee', label: 'Employee', render: (row) => row.first_name ? `${row.first_name} ${row.last_name}` : 'None' },
    { key: 'is_active', label: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} type={row.is_active ? 'success' : 'default'} /> },
    { key: 'last_login', label: 'Last Login', render: (row) => row.last_login ? new Date(row.last_login).toLocaleString() : 'Never' },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className={styles.actions}>
        <button onClick={() => openModal(row)}><Edit size={18} /></button>
        <button onClick={() => handleDelete(row.id)} className={styles.deleteBtn}><Trash2 size={18} /></button>
      </div>
    )}
  ];

  return (
    <div className={styles.container}>
      <PageHeader 
        title="User Management" 
        action={<Button onClick={() => openModal()}><Plus size={20} /> Add User</Button>}
      />

      <DataTable columns={columns} data={users} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <Input 
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input 
            type="password"
            label={currentUser ? "Password (leave blank to keep current)" : "Password"}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required={!currentUser}
          />
          <Select 
            label="Role"
            value={formData.role_id}
            onChange={(e) => setFormData({...formData, role_id: e.target.value})}
            options={roles.map(r => ({value: r.id, label: r.display_name || r.name}))}
            required
          />
          <Select 
            label="Linked Employee (Optional)"
            value={formData.employee_id}
            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
            options={[{value:'', label:'None'}, ...employees.map(e => ({value: e.id, label: `${e.first_name} ${e.last_name}`}))]}
          />
          
          <div className={styles.toggleGroup}>
            <label>Status</label>
            <Select 
              value={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
              options={[{value:1, label:'Active'}, {value:0, label:'Inactive'}]}
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
