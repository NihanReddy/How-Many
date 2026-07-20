// Settings page script
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  updateStorageUsage();
  setupEventListeners();
});

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSettings'
    });

    document.getElementById('trackingToggle').checked = response.trackingEnabled !== false;
    document.getElementById('celebrationToggle').checked = response.celebrationEnabled !== false;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function setupEventListeners() {
  document.getElementById('trackingToggle').addEventListener('change', (e) => {
    updateSetting('trackingEnabled', e.target.checked);
  });

  document.getElementById('celebrationToggle').addEventListener('change', (e) => {
    updateSetting('celebrationEnabled', e.target.checked);
  });

  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('clearBtn').addEventListener('click', clearAllData);

  // Attach back button listener to comply with CSP (no inline handlers)
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => window.history.back());
}

async function updateSetting(key, value) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSettings'
    });

    const settings = {
      ...response,
      [key]: value
    };

    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });

    showStatus('Settings saved', 'success');
  } catch (error) {
    console.error('Error updating settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

async function updateStorageUsage() {
  try {
    const data = await chrome.storage.local.getBytesInUse();
    const quota = 10 * 1024 * 1024; // 10MB default quota
    const percentage = Math.round((data / quota) * 100);
    const mbUsed = (data / (1024 * 1024)).toFixed(1);
    const mbTotal = (quota / (1024 * 1024)).toFixed(1);

    document.getElementById('storagePercent').textContent = percentage + '%';
    document.getElementById('storageText').textContent = `You are using ${mbUsed}MB of ${mbTotal}MB browser storage quota.`;

    // Update the progress circle
    const offset = 276 - (276 * percentage / 100);
    document.querySelector('.storage-progress').style.strokeDashoffset = offset;
  } catch (error) {
    console.error('Error updating storage:', error);
    document.getElementById('storageText').textContent = 'Unable to determine storage usage';
  }
}

async function exportData() {
  try {
    const data = await chrome.storage.local.get();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showStatus('Error exporting data', 'error');
  }
}

async function clearAllData() {
  if (confirm('⚠️ Are you absolutely sure? This will permanently delete all your visit history and cannot be undone.')) {
    try {
      await chrome.storage.local.clear();
      showStatus('All data cleared', 'success');
      
      // Reload after clearing
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing data:', error);
      showStatus('Error clearing data', 'error');
    }
  }
}

function showStatus(message, type) {
  // You can add a toast notification here if needed
  console.log(`${type}: ${message}`);
}

// Refresh storage usage periodically
setInterval(updateStorageUsage, 5000);

