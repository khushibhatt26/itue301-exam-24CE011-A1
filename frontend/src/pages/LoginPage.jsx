import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      login(data.employee, data.token);

      if (data.employee.role === 'hr') {
        navigate('/hr');
      } else {
        navigate('/my-leaves');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h2>Employee Portal Login</h2>
          <p>Sign in to manage leave applications and team requests</p>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. rahul@techsolutions.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login-box">
          <p className="quick-title">Quick Demo Login:</p>
          <div className="quick-buttons">
            <button
              type="button"
              className="btn-quick"
              onClick={() => handleQuickFill('rahul@techsolutions.com', 'password123')}
            >
              👤 Employee (Rahul)
            </button>
            <button
              type="button"
              className="btn-quick"
              onClick={() => handleQuickFill('priya@techsolutions.com', 'password123')}
            >
              👔 Manager (Priya)
            </button>
            <button
              type="button"
              className="btn-quick"
              onClick={() => handleQuickFill('sneha@techsolutions.com', 'password123')}
            >
              👩‍💼 HR Lead (Sneha)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
