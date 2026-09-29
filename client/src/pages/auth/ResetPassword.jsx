import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Login.module.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose a new password</h1>
          <p className={styles.subtitle}>Use at least 12 characters.</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className="form-label" htmlFor="new-password">New password</label>
          <input id="new-password" type="password" className="form-control" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} required autoComplete="new-password" />
          <label className="form-label" htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" type="password" className="form-control" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={12} required autoComplete="new-password" />
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Saving...' : 'Reset password'}
          </button>
        </form>
        <Link to="/login" className={styles.forgot}>Back to sign in</Link>
      </div>
    </div>
  );
}