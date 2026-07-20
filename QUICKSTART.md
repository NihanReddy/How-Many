# Quick Start Guide ⚡

## Step 1: Load the Extension

1. Open Chrome and go to: **chrome://extensions/**
2. Toggle **Developer mode** (top-right corner)
3. Click **Load unpacked**
4. Navigate to: `c:\Code\Web\Projects\How Many -Chrome Extension`
5. Click **Select Folder**

✅ Your extension is now installed!

## Step 2: Start Using It

1. **Click the extension icon** in your Chrome toolbar (top-right)
2. You should see the extension popup with:
   - Current site name
   - Visit count (starting at 0)
   - Action buttons

3. **Start browsing** - Every page you visit will increase the counter
4. Click the popup again to see your updated visit count

## Step 3: Features to Try

### Test Visit Counting
1. Go to any website (e.g., github.com)
2. Click the extension icon
3. The count should show how many times you've visited it
4. Reload the page (Ctrl+R) or visit again from another tab
5. Refresh the popup - count increases! ✨

### Test Milestone (1M Visits)
1. Open the service worker console:
   - Go to `chrome://extensions/`
   - Find "How Many" extension
   - Click **Service Worker** under "Inspect views"

2. In the console, run:
```javascript
chrome.storage.local.set({
  visits: { "test.com": 1000000 },
  milestones: { "test.com": [] }
});

// Then navigate to test.com or reload
```

3. You'll see a celebration notification! 🎉

### Test Disable Feature
1. Click the extension popup for any site
2. Click **⛔ Disable** button
3. The button changes to **✅ Enable** (green)
4. Visit that site - counter won't increase
5. Click **✅ Enable** to resume tracking

### Test Reset/Delete
1. Click the extension popup
2. **🔄 Reset** - Sets count to 0
3. **🗑️ Delete** - Removes all data for that site

### View All Sites
1. Scroll down in the popup to see "All Sites"
2. All tracked websites are listed with their counts
3. Disabled sites show a ⚠️ **DISABLED** badge

## Debugging Tips 🔧

### Check Data Storage
1. Open Chrome DevTools: **F12**
2. Go to **Application** → **Storage** → **Local Storage**
3. Find your extension URL
4. You'll see all your tracking data

### View Service Worker Logs
1. Go to `chrome://extensions/`
2. Find "How Many" extension
3. Click **Service Worker** link
4. Open the DevTools console to see logs

### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Find "How Many" extension
3. Click the **Reload** button (circular arrow icon)
4. Changes take effect immediately

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Extension icon not visible | Click the puzzle piece icon (extensions menu) and pin the extension |
| No counts increasing | Try hard refresh (Ctrl+Shift+R) on a website |
| Notification not showing | Check Chrome notification permissions in Settings |
| Data lost | Don't clear browsing data → Cache/Local Storage |

## Next Steps 📚

- Read the full README.md for detailed documentation
- Customize popup styling in `popup/popup.css`
- Modify milestone thresholds in `service-worker/service-worker.js` (lines 27-28)
- Add custom icons in `assets/` folder

---

**Questions?** Check README.md or the in-code comments!
