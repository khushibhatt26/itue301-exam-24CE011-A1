import React from 'react';

/**
 * LeaveRequestCard Component
 * Task 1 Requirement: Accepts props { fromDate, toDate, days, leaveType, reason, status }
 * Displays all six values with a colored pill badge for status.
 */
const LeaveRequestCard = ({ fromDate, toDate, days, leaveType, reason, status }) => {
  const colors = {
    pending: '#FFC107',
    approved: '#28A745',
    rejected: '#DC3545',
    cancelled: '#6C757D',
  };

  const statusKey = (status || 'pending').toLowerCase();
  const badgeColor = colors[statusKey] || '#6C757D';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="leave-card">
      <div className="leave-card-header">
        <div className="leave-type-info">
          <span className="leave-type-name">{leaveType || 'General Leave'}</span>
          <span className="leave-days-count">{days} {days === 1 ? 'day' : 'days'}</span>
        </div>
        <span
          className="status-pill"
          style={{
            backgroundColor: badgeColor,
            color: statusKey === 'pending' ? '#1f2937' : '#ffffff',
          }}
        >
          {status}
        </span>
      </div>

      <div className="leave-card-dates">
        <div className="date-item">
          <span className="date-label">From:</span>
          <span className="date-value">{formatDate(fromDate)}</span>
        </div>
        <span className="date-arrow">→</span>
        <div className="date-item">
          <span className="date-label">To:</span>
          <span className="date-value">{formatDate(toDate)}</span>
        </div>
      </div>

      <div className="leave-card-reason">
        <span className="reason-label">Reason:</span>
        <p className="reason-text">{reason || 'No reason specified'}</p>
      </div>
    </div>
  );
};

export default LeaveRequestCard;
