// Service Worker for tracking site visits
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only track main frame navigations
  if (details.frameId !== 0) return;

  // Skip incognito mode
  if (details.incognito) return;

  const url = new URL(details.url);
  const domain = url.hostname;

  // Skip about:blank, chrome://, new-tab-page, etc.
  if (!domain || domain.includes("chrome://") || domain === "") return;
  if (details.url.includes("chrome://newtab")) return;

  // Get current data
  const data = await chrome.storage.local.get(['visits', 'disabled', 'milestones', 'settings']);
  const visits = data.visits || {};
  const disabled = data.disabled || [];
  const milestones = data.milestones || {};
  const settings = data.settings || { trackingEnabled: true };

  // Check if tracking is globally disabled
  if (!settings.trackingEnabled) return;

  // Check if domain is disabled
  if (disabled.includes(domain)) return;

  // Increment visit count
  visits[domain] = (visits[domain] || 0) + 1;
  const newCount = visits[domain];

  // Check for milestones — only celebrate if celebrations are enabled
  if (!milestones[domain]) milestones[domain] = [];
  const celebrationsEnabled = settings.celebrationEnabled !== false;

  const celebrationMilestones = [100, 1000, 10000, 1000000, 10000000];
  for (const milestone of celebrationMilestones) {
    if (newCount === milestone && !milestones[domain].includes(milestone)) {
      milestones[domain].push(milestone);
      // Trigger celebration only if enabled
      if (celebrationsEnabled) {
        showCelebration(domain, newCount);
      }
    }
  }

  // Save updated data
  await chrome.storage.local.set({ visits, milestones });
});

// Show celebration notification
function showCelebration(domain, count) {
  let title = 'Milestone Achievement!';
  let message = '';

  if (count === 100) {
    title = 'Getting Started!';
    message = domain + ' has been visited 100 times!';
  } else if (count === 1000) {
    title = 'Regular Visitor!';
    message = domain + ' has been visited 1,000 times!';
  } else if (count === 10000) {
    title = 'Dedicated Fan!';
    message = domain + ' has been visited 10,000 times!';
  } else if (count === 1000000) {
    title = 'ONE MILLION VISITS!';
    message = domain + ' has been visited 1,000,000 times!';
  } else if (count === 10000000) {
    title = 'ULTIMATE MILESTONE!';
    message = domain + ' has been visited 10,000,000 times! You\'re a super fan!';
  }

  // Create and show notification (don't await - fire and forget)
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon128.png',
      title: title,
      message: message,
      priority: 2
    }).catch(() => {
      console.log('Notification triggered for:', domain, 'at', count, 'visits');
    });
  } catch (e) {
    console.log('Celebration triggered for:', domain, 'at', count, 'visits');
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSiteStats') {
    const domain = request.domain;
    chrome.storage.local.get(['visits', 'disabled', 'milestones'], (data) => {
      const visits = data.visits || {};
      const disabled = data.disabled || [];

      sendResponse({
        domain: domain,
        count: visits[domain] || 0,
        isDisabled: disabled.includes(domain),
        milestones: data.milestones?.[domain] || []
      });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'toggleDisable') {
    const domain = request.domain;
    chrome.storage.local.get(['disabled'], (data) => {
      const disabled = data.disabled || [];

      if (disabled.includes(domain)) {
        disabled.splice(disabled.indexOf(domain), 1);
      } else {
        disabled.push(domain);
      }

      chrome.storage.local.set({ disabled }, () => {
        sendResponse({ success: true, disabled: !data.disabled?.includes(domain) });
      });
    });
    return true;
  }

  if (request.action === 'deleteCount') {
    const domain = request.domain;
    chrome.storage.local.get(['visits', 'milestones'], (data) => {
      const visits = data.visits || {};
      const milestones = data.milestones || {};

      delete visits[domain];
      delete milestones[domain];

      chrome.storage.local.set({ visits, milestones }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === 'resetCount') {
    const domain = request.domain;
    chrome.storage.local.get(['visits', 'milestones'], (data) => {
      const visits = data.visits || {};
      const milestones = data.milestones || {};

      visits[domain] = 0;
      // Clear milestones so they can be re-earned after reset
      delete milestones[domain];

      chrome.storage.local.set({ visits, milestones }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (request.action === 'getAllStats') {
    chrome.storage.local.get(['visits', 'disabled', 'milestones'], (data) => {
      const visits = data.visits || {};
      const disabled = data.disabled || [];
      const milestones = data.milestones || {};

      const stats = Object.entries(visits).map(([domain, count]) => ({
        domain,
        count,
        isDisabled: disabled.includes(domain),
        milestones: milestones[domain] || []
      }));

      sendResponse({ stats });
    });
    return true;
  }

  if (request.action === 'getSettings') {
    chrome.storage.local.get(['settings'], (data) => {
      const settings = data.settings || { trackingEnabled: true };
      sendResponse(settings);
    });
    return true;
  }

  if (request.action === 'updateSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

