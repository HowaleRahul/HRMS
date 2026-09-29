import React, { useState } from 'react';
import { Briefcase, Users, FileText, Calendar, Plus } from 'lucide-react';
import styles from './RecruitmentDashboard.module.css';
import StatusBadge from '../../components/common/StatusBadge';

export default function RecruitmentDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');

  const tabs = [
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Calendar }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Briefcase className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Recruitment</h1>
            <p className={styles.subtitle}>Manage jobs, candidates, and interviews</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'jobs' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Job Openings</h2>
              <button className={styles.btnPrimary}><Plus size={18}/> Add Job Opening</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Vacancies</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className={styles.empty}>Mock job list</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'candidates' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Candidates</h2>
              <button className={styles.btnPrimary}><Plus size={18}/> Add Candidate</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Current Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className={styles.empty}>Mock candidates list</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Applications</h2>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Opening</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className={styles.empty}>Mock applications list</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Interviews</h2>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Interviewer</th>
                  <th>Date/Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className={styles.empty}>Mock interviews list</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
