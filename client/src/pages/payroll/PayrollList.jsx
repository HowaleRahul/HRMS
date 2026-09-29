import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, Search, CreditCard, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import styles from './PayrollList.module.css';
import StatusBadge from '../../components/common/StatusBadge';

export default function PayrollList() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ gross: 0, deductions: 0, net: 0 });

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      // Using generic API endpoint, assume payroll API exists
      const res = await api.get('/payroll');
      if (res.data.success) {
        setPayrolls(res.data.data);
        const sums = res.data.data.reduce((acc, curr) => ({
          gross: acc.gross + Number(curr.gross_earnings),
          deductions: acc.deductions + Number(curr.total_deductions),
          net: acc.net + Number(curr.net_salary)
        }), { gross: 0, deductions: 0, net: 0 });
        setSummary(sums);
      }
    } catch (err) {
      toast.error('Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    toast.success('Payroll generated (Mock)');
    // Implement actual modal logic
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <CreditCard className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Payroll Management</h1>
            <p className={styles.subtitle}>Manage employee salaries and payslips</p>
          </div>
        </div>
        <button className={styles.btnPrimary} onClick={handleGenerate}>
          Generate Payroll
        </button>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Total Gross Earnings</h3>
          <p className={styles.amount}>₹{summary.gross.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Deductions</h3>
          <p className={styles.amount}>₹{summary.deductions.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Net Salary</h3>
          <p className={styles.amount}>₹{summary.net.toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Gross Earnings</th>
                <th>Total Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr><td colSpan="7" className={styles.empty}>No payroll records found</td></tr>
              ) : (
                payrolls.map(pr => (
                  <tr key={pr.id}>
                    <td>{pr.employee_name} ({pr.employee_code})</td>
                    <td>{pr.month}/{pr.year}</td>
                    <td>₹{Number(pr.gross_earnings).toLocaleString()}</td>
                    <td>₹{Number(pr.total_deductions).toLocaleString()}</td>
                    <td>₹{Number(pr.net_salary).toLocaleString()}</td>
                    <td><StatusBadge status={pr.payment_status} /></td>
                    <td className={styles.actions}>
                      <button onClick={() => navigate(`/payroll/${pr.id}`)} className={styles.btnIcon} title="View Details">
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
