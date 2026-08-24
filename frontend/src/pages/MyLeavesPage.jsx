import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LeaveRequestCard from '../components/LeaveRequestCard';

const MyLeavesPage = () => {
  const { employee, token, updateEmployee } = useAuth();

  // Task 4: Maintain three states: leaves, loading, and error
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Client-side status filter: All | Pending | Approved | Rejected
  const [statusFilter, setStatusFilter] = useState('All');

  // Also fetch latest profile to keep balance updated
  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch user's leaves
      const response = await fetch('/api/v1/leaves/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load your leave history.');
      }

      const result = await response.json();
      setLeaves(result.data || []);

      // 2. Fetch fresh profile for latest leave balance
      const meResponse = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meResponse.ok) {
        const meData = await meResponse.json();
        if (meData.employee) {
          updateEmployee({ leaveBalance: meData.employee.leaveBalance });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load your leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, [token]);

  // Client-side filtering without triggering a new API request
  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === 'All') return true;
    return (leave.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="page-container">
      {/* Task 2: Display "Welcome, [Name]" at the top */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1 className="welcome-title">Welcome, {employee?.name || 'Employee'}</h1>
          <p className="welcome-subtitle">
            Department: <strong>{employee?.department || 'General'}</strong> | Designation: <strong>{employee?.designation || 'Staff'}</strong>
          </p>
        </div>
        <div className="balance-pill">
          <span className="balance-badge-label">Available Balance</span>
          <span className="balance-badge-val">{employee?.leaveBalance ?? 0} Days</span>
        </div>
      </div>

      <div className="section-toolbar">
        <div className="toolbar-title">
          <h2>My Leave History</h2>
          <span className="count-tag">{filteredLeaves.length} {filteredLeaves.length === 1 ? 'record' : 'records'}</span>
        </div>

        <div className="filter-controls">
          <label htmlFor="statusFilter" className="filter-label">Filter by Status:</label>
          <select
            id="statusFilter"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={fetchLeaveHistory} className="btn-refresh" title="Refresh list">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Task 4: 1) Display loading indicator while request is in progress */}
      {loading && (
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading your leave records...</p>
        </div>
      )}

      {/* Task 4: 2) Display "Failed to load your leave history." if server returns non-200 */}
      {!loading && error && (
        <div className="state-container error-state">
          <div className="error-icon">⚠️</div>
          <h3>{error}</h3>
          <p>Unable to connect to the backend server. Please make sure the backend is running.</p>
          <button onClick={fetchLeaveHistory} className="btn-retry">Try Again</button>
        </div>
      )}

      {/* Task 4: 3) Render leaves using LeaveRequestCard after a successful request */}
      {!loading && !error && (
        <>
          {filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <h3>No leave requests found</h3>
              <p>
                {statusFilter === 'All'
                  ? "You haven't submitted any leave requests yet."
                  : `No leave requests with '${statusFilter}' status.`}
              </p>
            </div>
          ) : (
            <div className="leaves-grid">
              {filteredLeaves.map((leave) => (
                <LeaveRequestCard
                  key={leave._id}
                  fromDate={leave.fromDate}
                  toDate={leave.toDate}
                  days={leave.days}
                  leaveType={leave.leaveTypeId?.name || 'General Leave'}
                  reason={leave.reason}
                  status={leave.status}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyLeavesPage;
