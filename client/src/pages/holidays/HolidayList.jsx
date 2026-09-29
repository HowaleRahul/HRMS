import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { holidayAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import styles from './HolidayList.module.css';

export default function HolidayList() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'national',
    description: ''
  });

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await holidayAPI.getByYear(year);
      setHolidays(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentHoliday) {
        await holidayAPI.update(currentHoliday.id, formData);
        toast.success('Holiday updated');
      } else {
        await holidayAPI.create(formData);
        toast.success('Holiday created');
      }
      setIsModalOpen(false);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to save holiday');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this holiday?')) {
      try {
        await holidayAPI.delete(id);
        toast.success('Holiday deleted');
        fetchHolidays();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openModal = (holiday = null) => {
    if (holiday) {
      setCurrentHoliday(holiday);
      setFormData({
        name: holiday.name,
        date: holiday.date.split('T')[0],
        type: holiday.type,
        description: holiday.description || ''
      });
    } else {
      setCurrentHoliday(null);
      setFormData({ name: '', date: '', type: 'national', description: '' });
    }
    setIsModalOpen(true);
  };

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'national': return 'success';
      case 'regional': return 'info';
      case 'company': return 'primary';
      case 'optional': return 'default';
      default: return 'default';
    }
  };

  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'day', label: 'Day', render: (row) => getDayName(row.date) },
    { key: 'type', label: 'Type', render: (row) => <StatusBadge status={row.type} type={getTypeColor(row.type)} /> },
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
        title="Holidays" 
        action={
          <div className={styles.headerActions}>
            <Select 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={years.map(y => ({value: y, label: y}))}
            />
            <Button onClick={() => openModal()}><Plus size={20} /> Add Holiday</Button>
          </div>
        }
      />

      <DataTable columns={columns} data={holidays} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentHoliday ? 'Edit Holiday' : 'Add Holiday'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <Select 
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            options={[
              {value:'national', label:'National'}, 
              {value:'regional', label:'Regional'}, 
              {value:'company', label:'Company'}, 
              {value:'optional', label:'Optional'}
            ]}
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
