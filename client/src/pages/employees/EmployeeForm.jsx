import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { employeeAPI, departmentAPI, designationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './EmployeeForm.module.css';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  const [formData, setFormData] = useState({
    personal: {
      first_name: '', last_name: '', email: '', phone: '', alt_phone: '',
      dob: '', gender: '', blood_group: '', marital_status: '', nationality: '',
      current_address: '', permanent_address: '', same_as_current: false
    },
    employment: {
      department_id: '', designation_id: '', manager_id: '',
      employment_type: 'Full-time', joining_date: '', confirmation_date: ''
    },
    bank: {
      bank_name: '', account_number: '', ifsc_code: '', branch: '', account_type: 'Savings'
    },
    salary: {
      basic: 0, hra: 0, da: 0, transport_allowance: 0, medical_allowance: 0, special_allowance: 0,
      pf: 0, professional_tax: 0, tds: 0, esi: 0, other_deductions: 0
    },
    emergency_contacts: []
  });

  useEffect(() => {
    fetchMasterData();
    if (isEditMode) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        departmentAPI.getAll(),
        designationAPI.getAll()
      ]);
      setDepartments(deptRes.data?.data || []);
      setDesignations(desigRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to load form options');
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const res = await employeeAPI.getById(id);
      const emp = res.data?.data;
      if (emp) {
        // Map API response to formData structure
        // This is a simplified mapping, adjust according to actual API response
        setFormData(prev => ({
          ...prev,
          personal: {
            first_name: emp.first_name || '',
            last_name: emp.last_name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            dob: emp.dob ? emp.dob.split('T')[0] : '',
            gender: emp.gender || '',
            blood_group: emp.blood_group || '',
            marital_status: emp.marital_status || '',
            nationality: emp.nationality || '',
            current_address: emp.current_address || '',
            permanent_address: emp.permanent_address || '',
            same_as_current: false
          },
          employment: {
            department_id: emp.department_id || '',
            designation_id: emp.designation_id || '',
            manager_id: emp.manager_id || '',
            employment_type: emp.employment_type || 'Full-time',
            joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
            confirmation_date: emp.confirmation_date ? emp.confirmation_date.split('T')[0] : ''
          }
        }));
      }
    } catch (error) {
      toast.error('Failed to load employee details');
      navigate('/employees');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (section, e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData.personal,
        ...formData.employment,
        bank: formData.bank,
        salary: formData.salary,
        emergency_contacts: formData.emergency_contacts
      };
      
      if (isEditMode) {
        await employeeAPI.update(id, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.create(payload);
        toast.success('Employee created successfully');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <PageHeader 
        title={isEditMode ? "Edit Employee" : "Add Employee"} 
        subtitle="Fill in the information below"
      />

      <div className={styles.formCard}>
        <div className={styles.tabs}>
          {['personal', 'employment', 'bank', 'salary', 'emergency'].map(tab => (
            <button 
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {activeTab === 'personal' && (
            <div className={styles.section}>
              <div className={styles.grid}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="first_name" value={formData.personal.first_name} onChange={(e) => handleInputChange('personal', e)} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="last_name" value={formData.personal.last_name} onChange={(e) => handleInputChange('personal', e)} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.personal.email} onChange={(e) => handleInputChange('personal', e)} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" name="phone" value={formData.personal.phone} onChange={(e) => handleInputChange('personal', e)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dob" value={formData.personal.dob} onChange={(e) => handleInputChange('personal', e)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" value={formData.personal.gender} onChange={(e) => handleInputChange('personal', e)} className="form-control">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className={styles.section}>
              <div className={styles.grid}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department_id" value={formData.employment.department_id} onChange={(e) => handleInputChange('employment', e)} className="form-control">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <select name="designation_id" value={formData.employment.designation_id} onChange={(e) => handleInputChange('employment', e)} className="form-control">
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select name="employment_type" value={formData.employment.employment_type} onChange={(e) => handleInputChange('employment', e)} className="form-control">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input type="date" name="joining_date" value={formData.employment.joining_date} onChange={(e) => handleInputChange('employment', e)} className="form-control" />
                </div>
              </div>
            </div>
          )}
          
          {/* Add Bank, Salary, Emergency sections similarly */}

          <div className={styles.actions}>
            <button type="button" className="btn" onClick={() => navigate('/employees')} style={{ backgroundColor: '#f3f4f6' }}>
              <X size={18} style={{ marginRight: '8px' }} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} style={{ marginRight: '8px' }} /> {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
