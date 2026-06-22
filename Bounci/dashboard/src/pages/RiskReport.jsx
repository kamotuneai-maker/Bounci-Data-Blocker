import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { dashboardAPI } from '../api';

export default function RiskReport() {
  const [risks, setRisks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, [filter]);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { risk_level: filter } : {};
      const data = await dashboardAPI.getRisks({ ...params, limit: 50 });
      if (data?.risks) setRisks(data.risks);
    } catch (err) {
      console.error('Failed to fetch risks', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRisks = risks.filter(risk => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (risk.user_email || '').toLowerCase().includes(searchLower) ||
             (risk.prompt_preview || '').toLowerCase().includes(searchLower);
    }
    return true;
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Risk Report</h1>
        <p className="page-description">Review flagged AI interactions.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '40px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'critical', 'high', 'medium', 'low'].map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`btn ${filter === level ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Tool</th>
                <th>Level</th>
                <th>Type</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.length > 0 ? filteredRisks.map(risk => (
                <tr key={risk.id}>
                  <td style={{whiteSpace:'nowrap', color:'var(--text-muted)', fontSize:'13px'}}>
                    {formatTime(risk.captured_at || risk.created_at)}
                  </td>
                  <td><span className="user-email">{risk.user_email}</span></td>
                  <td><span className="tool-badge">{risk.ai_tool}</span></td>
                  <td><span className={`risk-badge ${risk.risk_level}`}>{risk.risk_level}</span></td>
                  <td>{risk.risk_type}</td>
                  <td><span className="truncate mono">{risk.prompt_preview || risk.preview}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="empty-state">No risks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
