import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ApplyLeavePage = () => {
  const { token, employee, updateEmployee } = useAuth();
  const navigate = useNavigate();

  // Meaningful state values: selected leave type, computed number of days, form inputs
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [computedDays, setComputedDays] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch available leave types from public GET /api/v1/leave-types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/v1/leave-types');
        const result = await response.json();
        if (response.ok && result.data) {
          setLeaveTypes(result.data);
          if (result.data.length > 0) {
            setSelectedLeaveTypeId(result.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load leave types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  // Compute number of days whenever fromDate or toDate changes
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setComputedDays(diffDays);
      } else {
        setComputedDays(0);
      }
    } else {
      setComputedDays(0);
    }
  }, [fromDate, toDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedLeaveTypeId) {
      setErrorMsg('Please select a valid leave type.');
      return;
    }

    if (!fromDate || !toDate) {
      setErrorMsg('Please select both From and To dates.');
      return;
    }

    if (computedDays <= 0) {
      setErrorMsg('The "To Date" must be on or after the "From Date".');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/v1/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveTypeId: selectedLeaveTypeId,
          fromDate,
          toDate,
          days: computedDays,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit leave request.');
      }

      setSuccessMsg('Leave application submitted successfully! Redirecting...');
      if (data.remainingLeaveBalance !== undefined) {
        updateEmployee({ leaveBalance: data.remainingLeaveBalance });
      }

      setTimeout(() => {
        navigate('/my-leaves');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTypeDetails = leaveTypes.find((lt) => lt._id === selectedLeaveTypeId);

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="page-header">
          <h2>📝 Apply for Leave</h2>
          <p className="subtitle">Submit a new leave application to TechSolutions HR & Management</p>
        </div>

        <div className="balance-banner">
          <div className="balance-info">
            <span className="balance-title">Available Leave Balance:</span>
            <span className="balance-amount">{employee?.leaveBalance ?? 0} days</span>
          </div>
          {selectedTypeDetails && (
            <div className="type-limit-info">
              <span>{selectedTypeDetails.name} Max Limit: <strong>{selectedTypeDetails.maxDaysPerYear} days/year</strong></span>
            </div>
          )}
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="leave-form">
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type *</label>
            <select
              id="leaveType"
              value={selectedLeaveTypeId}
              onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
              required
              disabled={loading}
            >
              {leaveTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name} Leave ({type.maxDaysPerYear} days/year max)
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromDate">From Date *</label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="toDate">To Date *</label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="computation-banner">
            <span className="comp-label">Calculated Duration:</span>
            <span className="comp-days">{computedDays} {computedDays === 1 ? 'day' : 'days'}</span>
            {computedDays > (employee?.leaveBalance ?? 0) && (
              <span className="comp-warning">⚠️ Exceeds your current balance ({employee?.leaveBalance} days)!</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Leave</label>
            <textarea
              id="reason"
              rows="3"
              placeholder="Please provide a brief reason for your leave request (max 500 chars)..."
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <small className="char-count">{reason.length}/500 characters</small>
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={submitting || computedDays <= 0}
          >
            {submitting ? 'Submitting Application...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeavePage;
