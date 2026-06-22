import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, Users, MessageSquare,
  TrendingUp, TrendingDown, Clock, Shield, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { dashboardAPI } from '../api';

const RISK_COLORS = {
  critical: '#ff4444',
  high: '#ff8c42',
  medium: '#ffd93d',
  low: '#6bcb77'
};

export default function Dashboard() {
  // Initialize with empty/zero state
  const [summary, setSummary] = useState({
    total_prompts: 0,
    total_users: 0,
    critical_risks: 0,
    high_risks: 0,
    change_vs_last_week: 0
  });
  const [trend, setTrend] = useState([]);
  const [recentRisks, setRecentRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryData, trendData, risksData] = await Promise.all([
        dashboardAPI.getSummary().catch(() => null),
        dashboardAPI.getTrend(30).catch(() => null),
        dashboardAPI.getRisks({ limit: 5 }).catch(() => null)
      ]);

      if (summaryData) setSummary(summaryData);
      if (trendData?.trend) setTrend(trendData.trend);
      if (risksData?.risks) setRecentRisks(risksData.risks);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Risk distribution for pie chart
  const riskDistribution = [
    { name: 'Critical', value: parseInt(summary.risk_breakdown?.critical || 0), color: RISK_COLORS.critical },
    { name: 'High', value: parseInt(summary.risk_breakdown?.high || 0), color: RISK_COLORS.high },
    { name: 'Medium', value: parseInt(summary.risk_breakdown?.medium || 0), color: RISK_COLORS.medium },
    { name: 'Low', value: parseInt(summary.risk_breakdown?.low || 0), color: RISK_COLORS.low }
  ].filter(item => item.value > 0); // Only show segments with data

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getToolIcon = (tool) => {
    const icons = { chatgpt: '🤖', claude: '🔮', gemini: '✨', copilot: '💻' };
    return icons[tool?.toLowerCase()] || '🤖';
  };

  if (loading) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Compliance Dashboard</h1>
        <p className="page-description">
          Monitor your organization's AI tool usage and data security risks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><MessageSquare size={20} /></div>
          <div className="stat-value">{summary.total_prompts?.toLocaleString() || 0}</div>
          <div className="stat-label">Total AI Interactions</div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon critical"><AlertTriangle size={20} /></div>
          <div className="stat-value">{summary.risk_breakdown?.critical || 0}</div>
          <div className="stat-label">Critical Risks</div>
        </div>

        <div className="stat-card high">
          <div className="stat-icon high"><Shield size={20} /></div>
          <div className="stat-value">{summary.risk_breakdown?.high || 0}</div>
          <div className="stat-label">High Risks</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-value">{summary.active_users || 0}</div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="two-col">
        {/* Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">AI Usage Trend</h3>
              <p className="card-subtitle">Daily interactions over the last 30 days</p>
            </div>
          </div>
          <div className="chart-container">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="promptGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="#606070" />
                  <YAxis stroke="#606070" />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
                    labelFormatter={formatDate}
                  />
                  <Area type="monotone" dataKey="prompts" stroke="#6366f1" fill="url(#promptGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No trend data available yet</div>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Risk Distribution</h3>
              <p className="card-subtitle">Breakdown by severity level</p>
            </div>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            {riskDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {riskDistribution.map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">No risks detected yet (Good job!)</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Risks Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>AI Tool</th>
                <th>Risk Level</th>
                <th>Preview</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentRisks.length > 0 ? recentRisks.map(risk => (
                <tr key={risk.id}>
                  <td><span className="user-email">{risk.user_email}</span></td>
                  <td>
                    <span className="tool-badge">
                      {getToolIcon(risk.ai_tool)} {risk.ai_tool}
                    </span>
                  </td>
                  <td><span className={`risk-badge ${risk.risk_level}`}>{risk.risk_level}</span></td>
                  <td><span className="truncate mono" style={{color:'var(--text-secondary)'}}>{risk.prompt_preview || risk.preview}</span></td>
                  <td style={{color:'var(--text-muted)', fontSize:'13px'}}>{formatTime(risk.captured_at || risk.created_at)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="empty-state">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
