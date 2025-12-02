/**
 * serviceWorker.ts
 * Owain Williams
 */

const ALLOWED_ORIGINS = [
  'https://www.perplexity.ai'
];

function isAllowed(urlString: string) {
  try {
    const url = new URL(urlString);
    return ALLOWED_ORIGINS.includes(url.origin);
  } catch {
    return false;
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  console.log("tab loading")

  if (!tab.url || info.status !== 'complete') return;

  if (isAllowed(tab.url)) {
    console.log("attempting to open panel")
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    });
  } else {
    console.log("attempting to close panel")
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log("tab changed")

  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;

  if (isAllowed(tab.url)) {
    console.log("attempting to open panel")
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    });
  } else {
    console.log("attempting to close panel")
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(err => console.error(err));
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_SIDE_PANEL" && sender.tab?.id) {
    const tabId = sender.tab.id;

    chrome.sidePanel.open({ tabId }); // tab-specific panel
  }
});
