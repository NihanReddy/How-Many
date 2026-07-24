document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  await updateStorageInfo();
});

async function loadSettings() {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || { trackingEnabled: true, celebrationEnabled: true };

    const trackingToggle = document.getElementById('trackingToggle');
    const celebrationToggle = document.getElementById('celebrationToggle');

    if (trackingToggle) trackingToggle.checked = settings.trackingEnabled !== false;
    if (celebrationToggle) celebrationToggle.checked = settings.celebrationEnabled !== false;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function setupEventListeners() {
  const trackingToggle = document.getElementById('trackingToggle');
  if (trackingToggle) {
    trackingToggle.addEventListener('change', async (e) => {
      await updateSetting('trackingEnabled', e.target.checked);
    });
  }

  const celebrationToggle = document.getElementById('celebrationToggle');
  if (celebrationToggle) {
    celebrationToggle.addEventListener('change', async (e) => {
      await updateSetting('celebrationEnabled', e.target.checked);
    });
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const analyticsUrl = chrome.runtime.getURL('analytics/analytics.html');
      chrome.tabs.create({ url: analyticsUrl });
      window.close();
    });
  }

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllData);
  }

  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const text = item.textContent.trim().toLowerCase();
      if (text.includes('current site')) {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
      } else if (text.includes('full history')) {
        chrome.tabs.create({ url: chrome.runtime.getURL('analytics/analytics.html') });
      }
    });
  });

  const privacyBtn = document.querySelector('.privacy-btn');
  if (privacyBtn) {
    privacyBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://developer.chrome.com/docs/extensions/reference/api/storage' });
    });
  }
}

async function updateSetting(key, value) {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || { trackingEnabled: true, celebrationEnabled: true };
    settings[key] = value;
    await chrome.storage.local.set({ settings });

    // Notify service worker about the settings change
    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
  } catch (error) {
    console.error('Error updating setting:', error);
  }
}

async function exportData() {
  try {
    const data = await chrome.storage.local.get(null);
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.1.0',
      data: {
        visits: data.visits || {},
        disabled: data.disabled || [],
        milestones: data.milestones || {},
        settings: data.settings || { trackingEnabled: true, celebrationEnabled: true }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `how-many-backup-${dateStr}.json`;

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    // Clean up object URL after download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Failed to export data. Please try again.');
  }
}

async function clearAllData() {
  const confirmed = confirm(
    '⚠️ Are you sure you want to delete ALL visit data?\n\n' +
    'This action cannot be undone! All visit counts, disabled sites, and milestone records will be permanently removed.'
  );

  if (!confirmed) return;

  const doubleConfirmed = confirm(
    'Final confirmation: Delete all data permanently?'
  );

  if (!doubleConfirmed) return;

  try {
    await chrome.storage.local.clear();
    // Re-initialize default settings after clearing
    await chrome.storage.local.set({
      settings: { trackingEnabled: true, celebrationEnabled: true },
      visits: {},
      disabled: [],
      milestones: {}
    });

    await loadSettings();
    await updateStorageInfo();
    alert('All data has been cleared successfully.');
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Failed to clear data. Please try again.');
  }
}

async function updateStorageInfo() {
  try {
    const data = await chrome.storage.local.get(null);
    const jsonString = JSON.stringify(data);
    const bytesUsed = new TextEncoder().encode(jsonString).length;

    // Chrome storage quota is ~10MB (10,485,760 bytes) for local storage
    const quota = 10 * 1024 * 1024;
    const percentUsed = Math.min(100, Math.round((bytesUsed / quota) * 100));
    const formattedUsed = formatBytes(bytesUsed);
    const formattedQuota = formatBytes(quota);

    const storagePercentEl = document.getElementById('storagePercent');
    const storageTextEl = document.getElementById('storageText');

    if (storagePercentEl) storagePercentEl.textContent = `${percentUsed}%`;
    if (storageTextEl) {
      storageTextEl.textContent = `${formattedUsed} used out of ${formattedQuota}`;
    }

    // Update the storage ring SVG
    const progressCircle = document.querySelector('.storage-progress');
    if (progressCircle) {
      const circumference = 2 * Math.PI * 45; // r=45
      const offset = circumference - (percentUsed / 100) * circumference;
      progressCircle.style.strokeDasharray = `${circumference}`;
      progressCircle.style.strokeDashoffset = `${offset}`;
    }
  } catch (error) {
    console.error('Error updating storage info:', error);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

