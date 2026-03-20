// Hyperfocus Extension - Background Service Worker
// Monitors tabs during active focus sessions

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hyperfocus extension installed');
  chrome.storage.local.set({
    isSessionActive: false,
    sessionTask: '',
    distractionSites: [],
    tabCount: 0,
  });
});

// Tab monitoring - fires during active sessions
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const data = await chrome.storage.local.get(['isSessionActive', 'distractionSites', 'sessionTask']);
  if (!data.isSessionActive) return;

  const url = new URL(tab.url);
  const hostname = url.hostname.replace('www.', '');

  const match = data.distractionSites?.find(
    (site) => site.enabled && hostname.includes(site.urlPattern),
  );

  if (match) {
    chrome.tabs.sendMessage(tabId, {
      type: 'DISTRACTION_ALERT',
      site: match.label,
      task: data.sessionTask,
    });
  }
});

// Tab count monitoring
chrome.tabs.onCreated.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  if (tabs.length > 15) {
    const data = await chrome.storage.local.get(['isSessionActive']);
    if (data.isSessionActive) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: 'TAB_OVERLOAD',
          count: tabs.length,
        });
      }
    }
  }
});
