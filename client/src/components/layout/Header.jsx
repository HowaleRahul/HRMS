import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import styles from './Header.module.css';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const userEmail = user?.email || 'User';
  const userName = user?.name || user?.username || 'Administrator';
  const userRole = user?.role?.display_name || 'Admin';
  
  // Create dicebear avatar
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.logoContainer}>
        <button
          className={styles.sidebarToggle}
          onClick={() => setSidebarOpen((current) => !current)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link to="/dashboard" className={styles.brand}>
          <Shield className={styles.brandLogo} size={28} />
          <span>HRMS</span>
        </Link>
      </div>

      <div className={styles.topbarRight}>
        <div className={styles.profileMenu} ref={profileMenuRef}>
          <button
            className={styles.profileTrigger}
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <img src={avatarUrl} alt={userName} className={styles.topbarAvatar} />
          </button>

          {profileMenuOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileSummary}>
                <img src={avatarUrl} alt={userName} className={styles.dropdownAvatar} />
                <div className={styles.profileSummaryText}>
                  <div className={styles.profileName}>{userName}</div>
                  <div className={styles.profileRole}>{userRole}</div>
                </div>
              </div>

              <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
