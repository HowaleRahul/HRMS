import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
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
  const [formOptions, setFormOptions] = useState({ genders: [], employmentTypes: [] });
  
  const [formData, setFormData] = useState({
    personal: {
      first_name: '', last_name: '', email: '', phone: '', alt_phone: '',
      dob: '', gender_id: '', current_address: '', permanent_address: ''
    },
    employment: {
      department_id: '', designation_id: '', employment_type_id: '', joining_date: '', confirmation_date: ''
    }
  });

  useEffect(() => {
    fetchMasterData();
    if (isEditMode) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [deptRes, desigRes, optionsRes] = await Promise.all([
        departmentAPI.getAll(),
        designationAPI.getAll(),
        employeeAPI.getFormOptions()
      ]);
      setDepartments(deptRes.data?.data || []);
      setDesignations(desigRes.data?.data || []);
      setFormOptions(optionsRes.data?.data || { genders: [], employmentTypes: [] });
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
            dob: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
            gender_id: emp.gender_id || '',
            current_address: emp.current_address || '',
            permanent_address: emp.permanent_address || '',
          },
          employment: {
            department_id: emp.department_id || '',
            designation_id: emp.designation_id || '',
            employment_type_id: emp.employment_type_id || '',
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
        first_name: formData.personal.first_name,
        last_name: formData.personal.last_name,
        email: formData.personal.email,
        phone: formData.personal.phone,
        alternate_phone: formData.personal.alt_phone || null,
        date_of_birth: formData.personal.dob,
        gender_id: formData.personal.gender_id,
        current_address: formData.personal.current_address,
        permanent_address: formData.personal.permanent_address || null,
        department_id: formData.employment.department_id,
        designation_id: formData.employment.designation_id,
        employment_type_id: formData.employment.employment_type_id,
        joining_date: formData.employment.joining_date,
        confirmation_date: formData.employment.confirmation_date || null
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
          {['personal', 'employment'].map(tab => (
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
                  <input type="tel" name="phone" value={formData.personal.phone} onChange={(e) => handleInputChange('personal', e)} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dob" value={formData.personal.dob} onChange={(e) => handleInputChange('personal', e)} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender_id" value={formData.personal.gender_id} onChange={(e) => handleInputChange('personal', e)} className="form-control" required>
                    <option value="">Select</option>
                    {formOptions.genders.map(gender => <option key={gender.id} value={gender.id}>{gender.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Current Address</label>
                  <textarea name="current_address" value={formData.personal.current_address} onChange={(e) => handleInputChange('personal', e)} className="form-control" required />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className={styles.section}>
              <div className={styles.grid}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department_id" value={formData.employment.department_id} onChange={(e) => handleInputChange('employment', e)} className="form-control" required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <select name="designation_id" value={formData.employment.designation_id} onChange={(e) => handleInputChange('employment', e)} className="form-control" required>
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select name="employment_type_id" value={formData.employment.employment_type_id} onChange={(e) => handleInputChange('employment', e)} className="form-control" required>
                    <option value="">Select Employment Type</option>
                    {formOptions.employmentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input type="date" name="joining_date" value={formData.employment.joining_date} onChange={(e) => handleInputChange('employment', e)} className="form-control" required />
                </div>
              </div>
            </div>
          )}
          
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
