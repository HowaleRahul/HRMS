import React from 'react';
import styles from './StatusBadge.module.css';
import { getStatusColor } from '../../utils/formatters';

const StatusBadge = ({ status, size = 'md' }) => {
  const colorClass = getStatusColor(status);
  
  return (
    <span className={`${styles.badge} ${styles[size]} ${styles[colorClass]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
