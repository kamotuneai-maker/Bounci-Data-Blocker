import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  FileDown, 
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { authAPI } from './api';
import Dashboard from './pages/Dashboard';
import RiskReport from './pages/RiskReport';
import UserActivity from './pages/UserActivity';
import Login from './pages/Login';

// Sidebar Navigation Component
function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/risks', icon: AlertTriangle, label: 'Risk Report' },
    { path: '/users', icon: Users, label: 'User Activity' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo - Benny the Bouncer */}
      <div className="logo">
        <img 
          src="/Benny.png" 
          alt="Benny the Bouncer" 
          className="logo-img"
        />
        <div className="logo-text-container">
          <span className="logo-text">Bounci</span>
          <span className="logo-badge">Beta</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="nav-section">
        <div className="nav-label">Overview</div>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <nav className="nav-section">
        <div className="nav-label">Actions</div>
        <Link to="/export" className="nav-item">
          <FileDown size={20} />
          Export Report
        </Link>
        <Link to="/settings" className="nav-item">
          <Settings size={20} />
          Settings
        </Link>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="org-info">
          <div className="org-name">Demo Organization</div>
          <div className="org-plan">Phase 1 - Detection</div>
        </div>
        <button 
          className="nav-item" 
          onClick={() => {
            authAPI.logout();
            window.location.href = '/login';
          }}
          style={{ width: '100%', marginTop: '12px' }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }) {
  // For demo purposes, skip auth check
  // In production, uncomment this:
  // if (!authAPI.isAuthenticated()) {
  //   return <Navigate to="/login" replace />;
  // }
  
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/risks" element={
          <ProtectedRoute>
            <RiskReport />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <UserActivity />
          </ProtectedRoute>
        } />
        <Route path="/export" element={
          <ProtectedRoute>
            <ExportPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder pages
function ExportPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Export Compliance Report</h1>
        <p className="page-description">Generate PDF reports for auditors and compliance teams.</p>
      </div>
      <div className="card">
        <h3 className="card-title">Coming Soon</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          PDF export functionality will be available in the next update.
        </p>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Configure your organization's AI compliance policies.</p>
      </div>
      <div className="card">
        <h3 className="card-title">Organization Settings</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Policy configuration will be available in Phase 2.
        </p>
      </div>
    </div>
  );
}

export default App;
