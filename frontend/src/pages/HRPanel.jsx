import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HRPanel = () => {
  const { token, role } = useAuth();
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchAllLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all leave requests for HR review.');
      }

      const result = await response.json();
      setAllLeaves(result.data || []);
    } catch (err) {
      setError(err.message || 'Error loading HR data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, [token]);

  const handleUpdateStatus = async (id, status) => {
    setActionMessage('');
    try {
      const response = await fetch(`/api/v1/leaves/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update leave status');
      }

      setActionMessage(`✅ Request ${id.slice(-6)} successfully marked as '${status}'.`);
      fetchAllLeaves();
    } catch (err) {
      setActionMessage(`❌ Error: ${err.message}`);
    }
  };

  // Metrics
  const totalRequests = allLeaves.length;
  const pendingCount = allLeaves.filter((l) => l.status === 'pending').length;
  const approvedCount = allLeaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = allLeaves.filter((l) => l.status === 'rejected').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="hr-badge-header">
          <span className="badge-hr-icon">👩‍💼</span>
          <div>
            <h2>HR & Management Administration Panel</h2>
            <p className="subtitle">
              Overview and leave authorization portal (Verified HR Access: <code>{role}</code>)
            </p>
          </div>
        </div>
      </div>

      {actionMessage && <div className="alert alert-info">{actionMessage}</div>}

      {/* Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Applications</span>
          <span className="metric-value">{totalRequests}</span>
        </div>
        <div className="metric-card bg-pending">
          <span className="metric-label">Pending Approval</span>
          <span className="metric-value">{pendingCount}</span>
        </div>
        <div className="metric-card bg-approved">
          <span className="metric-label">Approved Leaves</span>
          <span className="metric-value">{approvedCount}</span>
        </div>
        <div className="metric-card bg-rejected">
          <span className="metric-label">Rejected Leaves</span>
          <span className="metric-value">{rejectedCount}</span>
        </div>
      </div>

      {/* Table of requests */}
      <div className="table-card">
        <div className="table-header">
          <h3>Employee Leave Applications</h3>
          <button onClick={fetchAllLeaves} className="btn-refresh">🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="state-container"><div className="spinner"></div></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <strong>{req.employeeId?.name || 'N/A'}</strong>
                      <div className="sub-text">{req.employeeId?.email}</div>
                    </td>
                    <td>{req.employeeId?.department || 'N/A'}</td>
                    <td><span className="badge-type">{req.leaveTypeId?.name || 'Leave'}</span></td>
                    <td>
                      {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                    </td>
                    <td><strong>{req.days}</strong></td>
                    <td className="reason-cell">{req.reason || '—'}</td>
                    <td>
                      <span className={`status-pill status-${req.status}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'pending' ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'approved')}
                            className="btn-approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                            className="btn-reject"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="action-done">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRPanel;
