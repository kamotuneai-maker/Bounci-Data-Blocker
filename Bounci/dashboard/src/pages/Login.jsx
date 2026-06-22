import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Skip auth for demo
    localStorage.setItem('bounci_demo', 'true');
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Benny the Bouncer Logo */}
        <div className="login-logo">
          <img 
            src="/Benny.png" 
            alt="Benny the Bouncer" 
            style={{ width: '80px', height: '80px', marginBottom: '16px' }}
          />
        </div>
        
        <h1 className="login-title">Bounci</h1>
        <p className="login-subtitle">The Compliance Bouncer for AI Tools</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button onClick={handleDemoMode} className="btn btn-secondary login-btn">
          Enter Demo Mode
        </button>

        <p className="login-footer">
          Benny's watching the door. Your data stays safe. 🐕
        </p>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: 20px;
        }

        .login-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 48px;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow-card);
        }

        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }

        .login-title {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .login-subtitle {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: 32px;
          font-size: 14px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input {
          background: var(--bg-hover);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          font-size: 14px;
          color: var(--text-primary);
          font-family: var(--font-display);
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-group input::placeholder {
          color: var(--text-muted);
        }

        .login-btn {
          width: 100%;
          justify-content: center;
          padding: 14px;
          font-size: 15px;
        }

        .login-error {
          background: var(--risk-critical-bg);
          color: var(--risk-critical);
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 13px;
          text-align: center;
        }

        .login-divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .login-divider span {
          padding: 0 16px;
        }

        .login-footer {
          text-align: center;
          color: var(--text-muted);
          font-size: 12px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}

export default Login;
