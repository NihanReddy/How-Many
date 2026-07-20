let currentDomain = null;
let sortByCount = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current site
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs[0]) {
      document.getElementById('currentSite').textContent = 'Unable to detect site';
      return;
    }
    const url = new URL(tabs[0].url);
    currentDomain = url.hostname;

    // Load and display current site stats
    loadCurrentSiteStats();
    loadAllSiteStats();

    // Add event listeners
    document.getElementById('resetBtn').addEventListener('click', () => resetCount(currentDomain));
    document.getElementById('toggleDisableBtn').addEventListener('click', () => toggleDisable(currentDomain));
    document.getElementById('deleteBtn').addEventListener('click', () => deleteCount(currentDomain));
    document.getElementById('sortBtn').addEventListener('click', toggleSort);
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('analyticsBtn').addEventListener('click', openAnalytics);
    document.getElementById('settingsNavBtn').addEventListener('click', openSettings);
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
    document.getElementById('currentCount').textContent = formatCount(response.count || 0);

    // Update disable button text
    const toggleBtn = document.getElementById('toggleDisableBtn');
    if (response.isDisabled) {
      toggleBtn.textContent = '✅ Enable';
      toggleBtn.style.background = '#4caf50';
      toggleBtn.style.color = 'white';
    } else {
      toggleBtn.textContent = '⛔ Disable';
      toggleBtn.style.background = '#e8e8e8';
      toggleBtn.style.color = '#333';
    }
  } catch (error) {
    console.error('Error loading current site stats:', error);
    document.getElementById('currentCount').textContent = '0';
  }
}

async function loadAllSiteStats() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getAllStats'
    });

    let stats = response.stats || [];
    
    if (sortByCount) {
      stats.sort((a, b) => b.count - a.count);
    } else {
      stats.sort((a, b) => b.count - a.count); // Default sort by count
    }

    const sitesList = document.getElementById('sitesList');
    
    if (stats.length === 0) {
      sitesList.innerHTML = '<div class="loading">No sites visited yet. Start browsing!</div>';
      return;
    }

    sitesList.innerHTML = stats.map(site => `
      <div class="site-item ${site.isDisabled ? 'site-item-disabled' : ''}">
        <div class="site-info">
          <div class="site-item-name">${escapeHtml(site.domain)}</div>
          <div class="site-item-count">
            ${formatCount(site.count)} visits
            ${site.milestones && site.milestones.includes(1000000) ? '<span class="milestone">1M 🎉</span>' : ''}
            ${site.milestones && site.milestones.includes(10000000) ? '<span class="milestone">10M 🚀</span>' : ''}
          </div>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          ${site.isDisabled ? '<span class="disabled-badge">DISABLED</span>' : ''}
          <button class="site-delete-btn" onclick="deleteSiteFromList('${escapeHtml(site.domain)}')">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading all site stats:', error);
    document.getElementById('sitesList').innerHTML = '<div class="loading">Error loading data</div>';
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
      loadAllSiteStats();
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
    loadAllSiteStats();
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
      loadAllSiteStats();
    } catch (error) {
      console.error('Error deleting count:', error);
      alert('Error deleting data');
    }
  }
}

function toggleSort() {
  sortByCount = !sortByCount;
  loadAllSiteStats();
}

function formatCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function deleteSiteFromList(domain) {
  if (confirm(`Delete all data for ${domain}?`)) {
    try {
      await chrome.runtime.sendMessage({
        action: 'deleteCount',
        domain: domain
      });
      loadCurrentSiteStats();
      loadAllSiteStats();
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Error deleting site');
    }
  }
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
  loadAllSiteStats();
});
