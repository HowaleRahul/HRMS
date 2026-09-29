import React from 'react';
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick, trend, trendValue }) => {
  // Map our generic color string to SteelMart gradients
  const getGradient = () => {
    switch(color) {
      case 'primary': return 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)';
      case 'success': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'danger': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #ef6c00 100%)';
      case 'info': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      default: return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: getGradient(),
        border: 'none',
        borderRadius: '14px',
        padding: '16px 20px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minWidth: '165px',
        flex: '1',
        textAlign: 'left',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
        width: '100%',
        height: '100%',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.18)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
        }
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '10px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {Icon && <Icon size={28} color="#fff" />}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '14px',
          lineHeight: 1.2,
          whiteSpace: 'pre-line',
          marginBottom: '4px'
        }}>{title}</div>
        
        <div style={{
          color: '#fff',
          fontSize: '24px',
          fontWeight: 800,
          lineHeight: 1,
        }}>{value}</div>
        
        {onClick && (
          <div style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '11px',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            View Details
            <ArrowRight size={10} />
          </div>
        )}
      </div>
    </button>
  );
};

export default StatCard;
