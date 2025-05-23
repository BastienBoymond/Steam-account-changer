chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'closeTab' && request.tabId) {
    chrome.tabs.remove(request.tabId);
  }
}); 