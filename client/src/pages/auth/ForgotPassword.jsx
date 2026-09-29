import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Login.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch {
      toast.error('Unable to submit the password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.subtitle}>{submitted ? 'If the address is registered, a reset link will be sent.' : 'Enter the email address associated with your account.'}</p>
        </div>
        {!submitted && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className="form-label" htmlFor="reset-email">Email</label>
            <input id="reset-email" type="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
        <Link to="/login" className={styles.forgot}>Back to sign in</Link>
      </div>
    </div>
  );
}