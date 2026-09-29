import React, { useState } from 'react';
import { Download, FileText, Users, Calendar, Clock, DollarSign, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import styles from './ReportsDashboard.module.css';

export default function ReportsDashboard() {
  const [activeReport, setActiveReport] = useState('employees');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Minimal filters for demo
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: ''
  });

  const reportTypes = [
    { id: 'employees', title: 'Employee Report', icon: Users },
    { id: 'attendance', title: 'Attendance Report', icon: Clock },
    { id: 'leaves', title: 'Leave Report', icon: Calendar },
    { id: 'payroll', title: 'Payroll Report', icon: DollarSign },
    { id: 'departments', title: 'Department Report', icon: Building },
    { id: 'joining-exit', title: 'Joining/Exit Report', icon: FileText },
  ];

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.get(activeReport, filters);
      setData(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await reportAPI.export(activeReport, { ...filters, format });
      
      const blob = new Blob([res], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeReport}_report.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`Failed to export ${format}`);
    }
  };

  const getColumns = () => {
    if (data.length === 0) return [];
    // Generate simple columns based on keys of first object
    return Object.keys(data[0]).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      render: (row) => {
        const val = row[key];
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (val && String(val).match(/^\d{4}-\d{2}-\d{2}/)) return new Date(val).toLocaleDateString();
        return val;
      }
    }));
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Reports" />

      <div className={styles.cardsGrid}>
        {reportTypes.map(rt => {
          const Icon = rt.icon;
          return (
            <div 
              key={rt.id} 
              className={`${styles.card} ${activeReport === rt.id ? styles.activeCard : ''}`}
              onClick={() => { setActiveReport(rt.id); setData([]); }}
            >
              <Icon size={24} className={styles.cardIcon} />
              <h3>{rt.title}</h3>
            </div>
          );
        })}
      </div>

      <div className={styles.contentArea}>
        <div className={styles.controls}>
          <div className={styles.filters}>
            {['employees', 'attendance', 'leaves', 'joining-exit'].includes(activeReport) && (
              <>
                <Input 
                  type="date" label="From Date" 
                  value={filters.date_from} 
                  onChange={e => setFilters({...filters, date_from: e.target.value})} 
                />
                <Input 
                  type="date" label="To Date" 
                  value={filters.date_to} 
                  onChange={e => setFilters({...filters, date_to: e.target.value})} 
                />
              </>
            )}
            <Button onClick={fetchReport}>Generate</Button>
          </div>
          
          <div className={styles.exports}>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download size={16} /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download size={16} /> Export PDF
            </Button>
          </div>
        </div>

        {data.length > 0 ? (
          <div className={styles.tableWrapper}>
            <DataTable columns={getColumns()} data={data} loading={loading} />
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <p>Select a report and generate to view data</p>
          </div>
        )}
      </div>
    </div>
  );
}
