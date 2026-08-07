import React from 'react';
import { MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md';

export default function Table({
  columns = [],
  data = [],
  searchable = true,
  searchQuery = '',
  onSearchChange,
  filterComponent,
  page = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  emptyMessage = 'No records found'
}) {
  return (
    <div className="table-wrapper-glass">
      {(searchable || filterComponent) && (
        <div className="table-controls">
          {searchable && (
            <div className="table-search-input">
              <MdSearch size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </div>
          )}
          {filterComponent && <div className="table-filters">{filterComponent}</div>}
        </div>
      )}

      <div className="table-responsive">
        <table className="table-custom">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="table-loader-cell">
                  <div className="neon-spinner" />
                  <p>Loading data...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx} className="table-row">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <div className="pagination-buttons">
            <button
              className="btn btn-icon"
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >
              <MdChevronLeft size={20} />
            </button>
            <button
              className="btn btn-icon"
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
