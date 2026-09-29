import React from 'react';
import { PackageOpen } from 'lucide-react';
import styles from './EmptyState.module.css';

const EmptyState = ({ title, description, action }) => {
  return (
    <div className={styles.container}>
      <PackageOpen className={styles.icon} size={48} />
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;
