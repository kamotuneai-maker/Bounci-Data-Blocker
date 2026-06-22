// popup.js - Bounci Side Panel
// Uses chrome.storage.onChanged for reliable real-time updates
console.log('🎩 [Bounci] Side Panel loaded');

// Tool icons mapping
const TOOL_ICONS = {
  chatgpt: '🤖',
  claude: '🔮',
  gemini: '✨',
  copilot: '💻',
  unknown: '🤖'
};

// Risk level styling
const RISK_STYLES = {
  critical: { bg: 'rgba(255, 68, 68, 0.2)', color: '#ff4444' },
  high: { bg: 'rgba(255, 140, 66, 0.2)', color: '#ff8c42' },
  medium: { bg: 'rgba(255, 217, 61, 0.2)', color: '#ffd93d' },
  low: { bg: 'rgba(107, 203, 119, 0.2)', color: '#6bcb77' },
  none: { bg: 'rgba(107, 203, 119, 0.2)', color: '#6bcb77' },
  pending: { bg: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }
};

// Update stats display
function updateStats(totalPrompts, risksFound) {
  const totalEl = document.getElementById('totalPrompts');
  const risksEl = document.getElementById('risksFound');
  
  if (totalEl) totalEl.textContent = totalPrompts || 0;
  if (risksEl) risksEl.textContent = risksFound || 0;
}

// Render recent activity list
function renderRecentList(activities) {
  const list = document.getElementById('recentList');
  if (!list) return;
  
  if (!activities || activities.length === 0) {
    list.innerHTML = `
      <div class="recent-item">
        <span class="tool">👀</span>
        <span class="preview">Waiting for activity...</span>
      </div>
    `;
    return;
  }
  
  list.innerHTML = activities.map(item => {
    const icon = TOOL_ICONS[item.tool] || TOOL_ICONS.unknown;
    const risk = item.risk || 'pending';
    const style = RISK_STYLES[risk] || RISK_STYLES.pending;
    
    return `
      <div class="recent-item">
        <span class="tool">${icon}</span>
        <span class="preview">${escapeHtml(item.preview || 'Processing...')}</span>
        <span class="risk" style="background: ${style.bg}; color: ${style.color};">${risk}</span>
      </div>
    `;
  }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load initial data from storage
function loadFromStorage() {
  chrome.storage.local.get(['totalPrompts', 'risksFound', 'recentActivity'], (data) => {
    console.log('📦 [Bounci] Loaded from storage:', data);
    updateStats(data.totalPrompts, data.risksFound);
    renderRecentList(data.recentActivity);
  });
}

// Listen for storage changes (THIS IS THE KEY FOR REAL-TIME UPDATES)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  
  console.log('🔥 [Bounci] Storage changed:', Object.keys(changes));
  
  if (changes.totalPrompts) {
    const totalEl = document.getElementById('totalPrompts');
    if (totalEl) totalEl.textContent = changes.totalPrompts.newValue || 0;
  }
  
  if (changes.risksFound) {
    const risksEl = document.getElementById('risksFound');
    if (risksEl) risksEl.textContent = changes.risksFound.newValue || 0;
  }
  
  if (changes.recentActivity) {
    renderRecentList(changes.recentActivity.newValue);
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  console.log('✅ [Bounci] Side Panel ready');
});

// Also load immediately (in case DOMContentLoaded already fired)
loadFromStorage();
