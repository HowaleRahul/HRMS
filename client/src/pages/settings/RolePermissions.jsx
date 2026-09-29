import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import styles from './RolePermissions.module.css';

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState({});
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', display_name: '', description: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([
        userAPI.getRoles(),
        userAPI.getPermissions()
      ]);
      const rolesData = rRes.data?.data || [];
      setRoles(rolesData);
      setAllPermissions(pRes.data?.data || {});
      if (rolesData.length > 0) {
        handleRoleSelect(rolesData[0]);
      }
    } catch (error) {
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    setActiveRole(role);
    try {
      const res = await userAPI.getRolePermissions(role.id);
      setRolePermissions((res.data?.data || []).map(p => p.id));
    } catch (error) {
      toast.error('Failed to load role permissions');
      setRolePermissions([]);
    }
  };

  const togglePermission = (permId) => {
    setRolePermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!activeRole) return;
    try {
      setSaving(true);
      await userAPI.updateRolePermissions(activeRole.id, rolePermissions);
      toast.success('Permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRole) {
        await userAPI.updateRole(currentRole.id, formData);
        toast.success('Role updated');
      } else {
        await userAPI.createRole(formData);
        toast.success('Role created');
      }
      setIsModalOpen(false);
      const rRes = await userAPI.getRoles();
      setRoles(rRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this role?')) {
      try {
        await userAPI.deleteRole(id);
        toast.success('Role deleted');
        const rRes = await userAPI.getRoles();
        setRoles(rRes.data?.data || []);
        if (activeRole?.id === id) setActiveRole(null);
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  const openModal = (role = null, e = null) => {
    if (e) e.stopPropagation();
    if (role) {
      setCurrentRole(role);
      setFormData({ name: role.name, display_name: role.display_name, description: role.description || '' });
    } else {
      setCurrentRole(null);
      setFormData({ name: '', display_name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  // Extract unique actions from all permissions to build grid columns
  const allActions = new Set();
  Object.values(allPermissions).forEach(modulePerms => {
    modulePerms.forEach(p => allActions.add(p.action));
  });
  const actionsList = Array.from(allActions).sort();

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Role & Permissions" 
      />

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Roles</h3>
            <Button onClick={() => openModal()} size="small" variant="outline">
              <Plus size={16} /> Add
            </Button>
          </div>
          <ul className={styles.roleList}>
            {roles.map(role => (
              <li 
                key={role.id} 
                className={activeRole?.id === role.id ? styles.activeRole : ''}
                onClick={() => handleRoleSelect(role)}
              >
                <span>{role.display_name || role.name}</span>
                <div className={styles.roleActions}>
                  <button onClick={(e) => openModal(role, e)}><Edit size={14} /></button>
                  <button onClick={(e) => handleDeleteRole(role.id, e)}><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.mainContent}>
          {activeRole ? (
            <>
              <div className={styles.contentHeader}>
                <h3>Permissions for "{activeRole.display_name || activeRole.name}"</h3>
                <Button onClick={handleSavePermissions} disabled={saving}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              <div className={styles.gridContainer}>
                <table className={styles.permissionsTable}>
                  <thead>
                    <tr>
                      <th>Module</th>
                      {actionsList.map(action => (
                        <th key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(allPermissions).map(([moduleName, perms]) => (
                      <tr key={moduleName}>
                        <td className={styles.moduleName}>{moduleName.toUpperCase()}</td>
                        {actionsList.map(action => {
                          const perm = perms.find(p => p.action === action);
                          return (
                            <td key={action}>
                              {perm ? (
                                <input 
                                  type="checkbox" 
                                  className={styles.checkbox}
                                  checked={rolePermissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                />
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>Select a role to view permissions</div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRole ? 'Edit Role' : 'Add Role'}>
        <form onSubmit={handleRoleSubmit} className={styles.form}>
          <Input 
            label="Role Code/Name (e.g., admin)"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Display Name (e.g., Administrator)"
            value={formData.display_name}
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            required
          />
          <Input 
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
