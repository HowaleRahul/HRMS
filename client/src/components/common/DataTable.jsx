import React from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DataTable.module.css';

const DataTable = ({ columns, data, loading, onSort, sortBy, sortOrder, pagination }) => {
  if (loading) {
    return <div className={styles.loading}>Loading...</div>; // Could use Loader component
  }

  if (!data || data.length === 0) {
    return <div className={styles.empty}>No data available.</div>; // Could use EmptyState
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                className={col.sortable ? styles.sortable : ''}
              >
                <div className={styles.thContent}>
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem', gap: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className={styles.pageBtn} 
            disabled={pagination.currentPage === 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            aria-label="Previous Page"
            style={{ padding: '0.5rem', cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button 
            className={styles.pageBtn} 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            aria-label="Next Page"
            style={{ padding: '0.5rem', cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
