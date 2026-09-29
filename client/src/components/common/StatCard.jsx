import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, trendValue }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h4 className={styles.title}>{title}</h4>
          <span className={styles.value}>{value}</span>
        </div>
        <div className={`${styles.iconWrapper} ${styles[color]}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      {trend && (
        <div className={`${styles.trend} ${trend === 'up' ? styles.trendUp : styles.trendDown}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
