import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ fullPage = false }) => {
  return (
    <div className={fullPage ? styles.fullPage : styles.inline}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Loader;
