import React, { useState, useEffect } from 'react';
import { Plus, Table, Grid, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { noticeAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import styles from './NoticeList.module.css';

export default function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    target_audience: 'all',
    expires_at: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeAPI.getAll(); // Or getActive for non-admins
      setNotices(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentNotice) {
        await noticeAPI.update(currentNotice.id, formData);
        toast.success('Notice updated');
      } else {
        await noticeAPI.create(formData);
        toast.success('Notice created');
      }
      setIsModalOpen(false);
      fetchNotices();
    } catch (error) {
      toast.error('Failed to save notice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await noticeAPI.delete(id);
        toast.success('Notice deleted');
        fetchNotices();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openModal = (notice = null) => {
    if (notice) {
      setCurrentNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        type: notice.type,
        target_audience: notice.target_audience,
        expires_at: notice.expires_at ? notice.expires_at.split('T')[0] : ''
      });
    } else {
      setCurrentNotice(null);
      setFormData({ title: '', content: '', type: 'general', target_audience: 'all', expires_at: '' });
    }
    setIsModalOpen(true);
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'urgent': return 'error';
      case 'important': return 'warning';
      default: return 'info';
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type', render: (row) => <StatusBadge status={row.type} type={getTypeColor(row.type)} /> },
    { key: 'target_audience', label: 'Audience' },
    { key: 'published_by_username', label: 'Published By' },
    { key: 'created_at', label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
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
        title="Notices & Announcements" 
        action={
          <div className={styles.headerActions}>
            <div className={styles.viewToggle}>
              <button className={viewMode === 'cards' ? styles.active : ''} onClick={() => setViewMode('cards')}><Grid size={20}/></button>
              <button className={viewMode === 'table' ? styles.active : ''} onClick={() => setViewMode('table')}><Table size={20}/></button>
            </div>
            <Button onClick={() => openModal()}><Plus size={20} /> Create Notice</Button>
          </div>
        }
      />

      {loading ? (
        <div>Loading...</div>
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={notices} />
      ) : (
        <div className={styles.cardsGrid}>
          {notices.map(notice => (
            <div key={notice.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <StatusBadge status={notice.type} type={getTypeColor(notice.type)} />
                <span className={styles.date}>{new Date(notice.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className={styles.cardTitle}>{notice.title}</h3>
              <p className={styles.cardContent}>{notice.content}</p>
              <div className={styles.cardFooter}>
                <span>By: {notice.published_by_username}</span>
                <span>To: {notice.target_audience}</span>
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => openModal(notice)}><Edit size={16} /></button>
                <button onClick={() => handleDelete(notice.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentNotice ? 'Edit Notice' : 'Create Notice'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <div className={styles.formGroup}>
            <label>Content</label>
            <textarea 
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
              className={styles.textarea}
            />
          </div>
          <Select 
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            options={[{value:'general', label:'General'}, {value:'important', label:'Important'}, {value:'urgent', label:'Urgent'}]}
          />
          <Select 
            label="Audience"
            value={formData.target_audience}
            onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
            options={[{value:'all', label:'All Employees'}, {value:'department', label:'Department'}]}
          />
          <Input 
            type="date"
            label="Expiry Date"
            value={formData.expires_at}
            onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
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
