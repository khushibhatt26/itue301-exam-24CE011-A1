import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { employee, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/" className="brand-link">
            <span className="brand-logo">🏢</span>
            <span className="brand-title">TechSolutions LeavePortal</span>
          </NavLink>
        </div>

        <nav className="nav-links">
          {!employee ? (
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Login
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/apply"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Apply Leave
              </NavLink>
              <NavLink
                to="/my-leaves"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                My Leaves
              </NavLink>
              <NavLink
                to="/hr"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                HR Panel {role === 'hr' && <span className="hr-badge">HR</span>}
              </NavLink>
            </>
          )}
        </nav>

        {employee && (
          <div className="navbar-user-section">
            <div className="user-pill">
              <span className="user-name">{employee.name}</span>
              <span className="user-role">({employee.role})</span>
              <span className="user-balance" title="Remaining Leave Balance">
                🌴 {employee.leaveBalance !== undefined ? employee.leaveBalance : '—'} days
              </span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
