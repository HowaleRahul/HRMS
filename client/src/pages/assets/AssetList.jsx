import React, { useState } from 'react';
import { Laptop, ClipboardCheck, Plus } from 'lucide-react';
import styles from './AssetList.module.css';

export default function AssetList() {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Laptop className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Asset Management</h1>
            <p className={styles.subtitle}>Track company assets and assignments</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'assets' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          <Laptop size={18} /> Assets
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'assignments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <ClipboardCheck size={18} /> Assignments
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'assets' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Company Assets</h2>
              <button className={styles.btnPrimary}><Plus size={18}/> Add Asset</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Asset Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="6" className={styles.empty}>No assets found</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Asset Assignments</h2>
              <button className={styles.btnPrimary}><Plus size={18}/> Assign Asset</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Assigned Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="6" className={styles.empty}>No assignments found</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
