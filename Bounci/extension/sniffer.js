// sniffer.js - Bounci AI Compliance Monitor
// Simple & resilient capture + chrome.storage for real-time UI
console.log("🎯 [Bounci] Benny is watching");

const CONFIG = {
  // UPDATE THIS LINE with your new ID from the login response:
  ORG_ID: 'fd78ab40-d124-4f07-942c-afeff51eebfc', 
  USER_EMAIL: 'employee@kamocorp.com', 
  SERVER_URL: 'https://kam-ai-backend-production.up.railway.app'
};

let lastKnownValue = "";
let lastCaptured = "";

const getPlatform = () => {
  const host = window.location.hostname;
  if (host.includes('openai.com') || host.includes('chatgpt.com')) return 'chatgpt';
  if (host.includes('claude.ai')) return 'claude';
  if (host.includes('gemini.google.com')) return 'gemini';
  if (host.includes('copilot.microsoft.com')) return 'copilot';
  return host.replace('www.', '');
};

const platform = getPlatform();

async function capturePrompt(text) {
  const cleanText = (text || lastKnownValue).trim();
  if (!cleanText || cleanText.length < 3 || cleanText === lastCaptured) return;
  
  lastCaptured = cleanText;
  const timestamp = new Date().toISOString();
  
  console.log("📤 [Bounci] Capturing:", cleanText.substring(0, 40) + "...");

  // 1. Update chrome.storage IMMEDIATELY (for responsive UI)
  chrome.storage.local.get(['totalPrompts', 'risksFound', 'recentActivity'], (data) => {
    const total = (data.totalPrompts || 0) + 1;
    const recent = data.recentActivity || [];
    
    recent.unshift({
      tool: platform,
      preview: cleanText.substring(0, 40) + (cleanText.length > 40 ? '...' : ''),
      risk: 'pending',
      time: timestamp
    });
    
    if (recent.length > 10) recent.pop();
    
    chrome.storage.local.set({
      totalPrompts: total,
      recentActivity: recent,
      lastPrompt: { text: cleanText, platform, time: timestamp, risk_level: 'pending' }
    });
  });

  // 2. Send to backend
  try {
    const res = await fetch(`${CONFIG.SERVER_URL}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: CONFIG.ORG_ID,
        user_email: CONFIG.USER_EMAIL,
        ai_tool: platform,
        prompt_text: cleanText,
        url: window.location.href
      })
    });
    
    if (res.ok) {
      const result = await res.json();
      console.log('✅ [Bounci] Backend:', result);
      
      // 3. Update storage with actual risk level
      chrome.storage.local.get(['recentActivity', 'risksFound'], (data) => {
        const recent = data.recentActivity || [];
        let risks = data.risksFound || 0;
        
        if (recent.length > 0 && recent[0].risk === 'pending') {
          const actualRisk = result.overall_risk || 'none';
          recent[0].risk = actualRisk;
          recent[0].prompt_id = result.prompt_id;
          
          if (actualRisk !== 'none' && actualRisk !== 'pending') {
            risks++;
          }
        }
        
        chrome.storage.local.set({ recentActivity: recent, risksFound: risks });
      });
    }
  } catch (err) {
    console.log('[Bounci] Offline:', err.message);
  }
}

// Track ALL text inputs (generic = resilient)
document.addEventListener('input', (e) => {
  const target = e.target;
  if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
    lastKnownValue = target.innerText || target.value || "";
  }
}, true);

// Capture on Enter
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    capturePrompt(lastKnownValue);
    setTimeout(() => { lastKnownValue = ""; }, 300);
  }
}, true);

// Capture on button click (loose matching = survives UI changes)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, [role="button"]');
  if (btn) {
    const content = (btn.innerText + btn.ariaLabel + btn.className).toLowerCase();
    if (content.includes('send') || content.includes('submit') || btn.querySelector('svg')) {
      capturePrompt(lastKnownValue);
      setTimeout(() => { lastKnownValue = ""; }, 300);
    }
  }
}, true);
