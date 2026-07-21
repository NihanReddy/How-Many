let currentDomain = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs[0]) {
      document.getElementById('currentSite').textContent = 'Unable to detect site';
      return;
    }

    const url = new URL(tabs[0].url);
    currentDomain = url.hostname;

    loadCurrentSiteStats();

    document.getElementById('resetBtn').addEventListener('click', () => resetCount(currentDomain));
    document.getElementById('toggleDisableBtn').addEventListener('click', () => toggleDisable(currentDomain));
    document.getElementById('deleteBtn').addEventListener('click', () => deleteCount(currentDomain));

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);

    const analyticsBtn = document.getElementById('analyticsBtn');
    if (analyticsBtn) analyticsBtn.addEventListener('click', openAnalytics);
  } catch (error) {
    console.error('Popup initialization error:', error);
    document.getElementById('currentSite').textContent = 'Error loading';
  }
});

async function loadCurrentSiteStats() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSiteStats',
      domain: currentDomain
    });

    document.getElementById('currentSite').textContent = currentDomain || 'Unknown';
    document.getElementById('currentCount').querySelector('.count-number').textContent = formatCount(response.count || 0);

    const toggleBtn = document.getElementById('toggleDisableBtn');
    const trackingState = document.getElementById('trackingState');

    if (response.isDisabled) {
      toggleBtn.innerHTML = '<span class="btn-icon">▶</span> Enable';
      toggleBtn.style.background = '#e8f5e9';
      toggleBtn.style.color = '#2e7d32';
      toggleBtn.style.borderColor = '#a5d6a7';
      if (trackingState) {
        trackingState.innerHTML = '<span class="status-dot" style="background: #888;"></span> Paused';
        trackingState.style.color = '#888';
      }
    } else {
      toggleBtn.innerHTML = '<span class="btn-icon">⏸</span> Disable';
      toggleBtn.style.background = '#eef2ff';
      toggleBtn.style.color = '#0058be';
      toggleBtn.style.borderColor = '#c2c6d6';
      if (trackingState) {
        trackingState.innerHTML = '<span class="status-dot"></span> Tracking';
        trackingState.style.color = '';
      }
    }
  } catch (error) {
    console.error('Error loading current site stats:', error);
    document.getElementById('currentCount').querySelector('.count-number').textContent = '0';
  }
}

async function resetCount(domain) {
  if (confirm(`Reset visit count for ${domain}?`)) {
    try {
      await chrome.runtime.sendMessage({
        action: 'resetCount',
        domain: domain
      });
      loadCurrentSiteStats();
    } catch (error) {
      console.error('Error resetting count:', error);
      alert('Error resetting count');
    }
  }
}

async function toggleDisable(domain) {
  try {
    await chrome.runtime.sendMessage({
      action: 'toggleDisable',
      domain: domain
    });
    loadCurrentSiteStats();
  } catch (error) {
    console.error('Error toggling disable:', error);
    alert('Error toggling disable');
  }
}

async function deleteCount(domain) {
  if (confirm(`Delete all data for ${domain}?`)) {
    try {
      await chrome.runtime.sendMessage({
        action: 'deleteCount',
        domain: domain
      });
      loadCurrentSiteStats();
    } catch (error) {
      console.error('Error deleting count:', error);
      alert('Error deleting data');
    }
  }
}

function formatCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function openAnalytics() {
  const analyticsUrl = chrome.runtime.getURL('analytics/analytics.html');
  chrome.tabs.create({ url: analyticsUrl });
  window.close();
}

// Refresh stats when popup is focused
window.addEventListener('focus', () => {
  loadCurrentSiteStats();
});
