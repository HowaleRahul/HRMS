import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import styles from './PayrollView.module.css';

export default function PayrollView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState(null);

  useEffect(() => {
    // Mock fetching
    const fetchPayroll = async () => {
      try {
        const res = await api.get(`/payroll/${id}`);
        if (res.data.success) {
          setPayroll(res.data.data);
        }
      } catch (err) {
        // mock fallback
        setPayroll({
          id,
          employee_name: 'John Doe',
          employee_code: 'EMP001',
          department_name: 'Engineering',
          designation_title: 'Software Engineer',
          month: 9,
          year: 2026,
          basic_salary: 50000,
          hra: 20000,
          da: 10000,
          transport_allowance: 5000,
          medical_allowance: 3000,
          special_allowance: 12000,
          pf_employee: 1800,
          professional_tax: 200,
          tds: 5000,
          esi: 0,
          other_deductions: 0,
          gross_earnings: 100000,
          total_deductions: 7000,
          net_salary: 93000,
          payment_status: 'paid'
        });
      }
    };
    fetchPayroll();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!payroll) return <div className={styles.loading}>Loading payslip...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/payroll')} className={styles.backBtn}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={handlePrint}>
            <Printer size={18} /> Print
          </button>
          <button className={styles.btnPrimary}>
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className={styles.payslipCard}>
        <div className={styles.payslipHeader}>
          <h2>Acme Corp</h2>
          <p>Payslip for the month of {payroll.month}/{payroll.year}</p>
        </div>

        <div className={styles.empDetails}>
          <div className={styles.detailGroup}>
            <label>Employee Name</label>
            <p>{payroll.employee_name}</p>
          </div>
          <div className={styles.detailGroup}>
            <label>Employee ID</label>
            <p>{payroll.employee_code}</p>
          </div>
          <div className={styles.detailGroup}>
            <label>Department</label>
            <p>{payroll.department_name}</p>
          </div>
          <div className={styles.detailGroup}>
            <label>Designation</label>
            <p>{payroll.designation_title}</p>
          </div>
        </div>

        <div className={styles.tablesContainer}>
          <div className={styles.tableBlock}>
            <h3>Earnings</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td>Basic Salary</td><td>₹{payroll.basic_salary}</td></tr>
                <tr><td>HRA</td><td>₹{payroll.hra}</td></tr>
                <tr><td>DA</td><td>₹{payroll.da}</td></tr>
                <tr><td>Transport Allowance</td><td>₹{payroll.transport_allowance}</td></tr>
                <tr><td>Medical Allowance</td><td>₹{payroll.medical_allowance}</td></tr>
                <tr><td>Special Allowance</td><td>₹{payroll.special_allowance}</td></tr>
                <tr className={styles.totalRow}>
                  <td>Gross Earnings</td>
                  <td>₹{payroll.gross_earnings}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.tableBlock}>
            <h3>Deductions</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td>Provident Fund (PF)</td><td>₹{payroll.pf_employee}</td></tr>
                <tr><td>Professional Tax</td><td>₹{payroll.professional_tax}</td></tr>
                <tr><td>TDS</td><td>₹{payroll.tds}</td></tr>
                <tr><td>ESI</td><td>₹{payroll.esi}</td></tr>
                <tr><td>Other Deductions</td><td>₹{payroll.other_deductions}</td></tr>
                <tr className={styles.totalRow}>
                  <td>Total Deductions</td>
                  <td>₹{payroll.total_deductions}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.netSalaryBlock}>
          <h3>Net Salary Payable: <span>₹{payroll.net_salary}</span></h3>
          <p>Amount in words: Ninety Three Thousand Rupees Only</p>
        </div>
      </div>
    </div>
  );
}
