import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, AlertTriangle } from 'lucide-react';
import { dashboardAPI } from '../api';

export default function UserActivity() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await dashboardAPI.getUsers({ limit: 50 });
      if (data?.users) setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPrompts = users.reduce((sum, u) => sum + parseInt(u.total_prompts || 0), 0);
  const totalRisks = users.reduce((sum, u) => sum + parseInt(u.high_risk_count || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Activity</h1>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MessageSquare size={20} /></div>
          <div className="stat-value">{totalPrompts}</div>
          <div className="stat-label">Total Prompts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={20} /></div>
          <div className="stat-value">{totalRisks}</div>
          <div className="stat-label">High Risks</div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Department</th>
                <th>Prompts</th>
                <th>High Risks</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map(user => (
                <tr key={user.id}>
                  <td><span className="user-email">{user.email}</span></td>
                  <td>{user.department || '-'}</td>
                  <td>{user.total_prompts}</td>
                  <td>
                    {user.high_risk_count > 0 ? (
                      <span className="risk-badge critical">{user.high_risk_count}</span>
                    ) : '0'}
                  </td>
                  <td style={{fontSize:'13px', color:'var(--text-muted)'}}>
                    {new Date(user.last_active).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="empty-state">No active users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
