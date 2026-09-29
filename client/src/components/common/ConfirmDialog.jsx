import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message, type = 'warning', isLoading = false }) => {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertCircle className={styles.iconDanger} size={48} />;
      case 'info': return <Info className={styles.iconInfo} size={48} />;
      default: return <AlertTriangle className={styles.iconWarning} size={48} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={!isLoading ? onCancel : undefined} title={title} size="sm">
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          {getIcon()}
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button 
            className={`${styles.btn} ${styles.btnCancel}`} 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={`${styles.btn} ${type === 'danger' ? styles.btnDanger : styles.btnPrimary}`} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
