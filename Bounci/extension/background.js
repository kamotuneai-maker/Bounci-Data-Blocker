// background.js - Bounci Service Worker
console.log('[Bounci] Benny the Bouncer is on duty!');

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Bounci] Extension installed');
  
  // Initialize storage with defaults
  chrome.storage.local.get(['totalPrompts', 'risksFound', 'recentActivity'], (data) => {
    if (data.totalPrompts === undefined) {
      chrome.storage.local.set({
        totalPrompts: 0,
        risksFound: 0,
        recentActivity: []
      });
    }
  });
  
  // Enable side panel
  chrome.sidePanel.setOptions({ enabled: true });
});

// Optional: Listen for messages if needed for future features
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['totalPrompts', 'risksFound'], (data) => {
      sendResponse(data);
    });
    return true; // Keep channel open for async response
  }
});
