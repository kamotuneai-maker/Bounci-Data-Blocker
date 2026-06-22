// api.js - Bounci Dashboard API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get the current Org ID from storage
const getOrgId = () => localStorage.getItem('bounci_org_id') || '';

// Helper for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('bounci_token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Save Token AND Org ID
    if (data.token) {
      localStorage.setItem('bounci_token', data.token);
    }
    if (data.org && data.org.id) {
      localStorage.setItem('bounci_org_id', data.org.id);
    }
    
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('bounci_token');
    localStorage.removeItem('bounci_org_id');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('bounci_token');
  }
};

// Dashboard API
export const dashboardAPI = {
  getSummary: async () => {
    return apiCall(`/api/dashboard/summary?org_id=${getOrgId()}`);
  },
  
  getTrend: async (days = 30) => {
    return apiCall(`/api/dashboard/trend?org_id=${getOrgId()}&days=${days}`);
  },
  
  getRisks: async ({ limit = 10, offset = 0, risk_level } = {}) => {
    const params = new URLSearchParams({
      org_id: getOrgId(),
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (risk_level) params.append('risk_level', risk_level);
    return apiCall(`/api/dashboard/risks?${params}`);
  },
  
  getUsers: async ({ limit = 10, offset = 0 } = {}) => {
    return apiCall(`/api/dashboard/users?org_id=${getOrgId()}&limit=${limit}&offset=${offset}`);
  },
  
  getPrompts: async ({ limit = 50, user_email, ai_tool } = {}) => {
    const params = new URLSearchParams({
      org_id: getOrgId(),
      limit: limit.toString()
    });
    if (user_email) params.append('user_email', user_email);
    if (ai_tool) params.append('ai_tool', ai_tool);
    return apiCall(`/api/prompts?${params}`);
  }
};

export default { authAPI, dashboardAPI };
