import React, { useState } from 'react';
import { Target, Star, Plus } from 'lucide-react';
import styles from './PerformanceList.module.css';

export default function PerformanceList() {
  const [activeTab, setActiveTab] = useState('reviews');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Star className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Performance</h1>
            <p className={styles.subtitle}>Employee reviews and goals tracking</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <Star size={18} /> Reviews
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'goals' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <Target size={18} /> Goals
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'reviews' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Performance Reviews</h2>
              <button className={styles.btnPrimary}><Plus size={18}/> Create Review</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Reviewer</th>
                  <th>Period</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="6" className={styles.empty}>No reviews found</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <div className={styles.contentHeader}>
              <h2>Performance Goals</h2>
              <button className={styles.btnPrimary}><Plus size={18}/> Add Goal</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Target Date</th>
                  <th>Status</th>
                  <th>Achievement %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="6" className={styles.empty}>No goals found</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
