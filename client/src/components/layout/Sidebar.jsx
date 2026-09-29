import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Clock, Calendar, Wallet, UserPlus, FileText, TrendingUp, Monitor, Bell, BarChart3, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const ADMIN_NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Human Resources',
    items: [
      { path: '/employees', label: 'Employees', icon: Users },
      { path: '/departments', label: 'Departments', icon: Building2 },
      { path: '/designations', label: 'Designations', icon: Building2 },
      { path: '/attendance', label: 'Attendance', icon: Clock },
      { path: '/leaves', label: 'Leaves', icon: Calendar },
      { path: '/payroll', label: 'Payroll', icon: Wallet },
    ],
  },
  {
    label: 'Organization',
    items: [
      { path: '/recruitment', label: 'Recruitment', icon: UserPlus },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/performance', label: 'Performance', icon: TrendingUp },
      { path: '/assets', label: 'Assets', icon: Monitor },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/notices', label: 'Notices', icon: Bell },
      { path: '/holidays', label: 'Holidays', icon: Calendar },
      { path: '/reports', label: 'Reports', icon: BarChart3 },
      { path: '/settings/users', label: 'Settings', icon: Settings },
    ]
  }
];

const Sidebar = ({ sidebarOpen, isMobile, setSidebarOpen }) => {
  return (
    <aside
      className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed} ${isMobile ? styles.mobile : styles.desktop}`}
    >
      <div className={styles.sidebarContent}>
        {ADMIN_NAV_SECTIONS.map((section) => (
          <React.Fragment key={section.label}>
            {section.label !== 'Main' && <div className={styles.sectionLabel}>{section.label}</div>}
            <nav className={styles.nav}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </React.Fragment>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
