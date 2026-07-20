# Update v1.1.0 - Major Features Added 🎉

## What's New

Your Chrome extension has been upgraded with powerful new features requested by users!

### ✨ New Features

#### 1. **Incognito Mode Support** 🔒
- Extension now **completely disabled in incognito/private browsing mode**
- Set with `incognito: "split"` in manifest
- Your private browsing stays truly private
- No visit data tracked in incognito windows

#### 2. **New Tab Page Filtering** 🆕
- Extension now **ignores chrome://newtab/** page
- Doesn't count new tab visits
- Only counts actual website visits
- Keeps stats clean and accurate

#### 3. **Settings Page** ⚙️
- Click the **⚙️ Settings** button in the popup header
- Customize extension behavior:
  - **Enable/Disable Tracking** - Turn tracking on/off globally
  - **Milestone Celebrations** - Toggle notifications
  - **Export Data** - Backup your visit data as JSON
  - **Clear All Data** - Nuclear option to reset everything
- All settings saved to Chrome storage

#### 4. **Delete from Site List** 🗑️
- Each site in the "All Sites" list now has a **🗑️ delete button**
- Click to instantly delete that site's data
- No need to click on a site first
- Quick and easy data management

#### 5. **Enhanced UI** 🎨
- Settings icon (⚙️) in the header
- Delete buttons (🗑️) for quick actions on each site
- Better visual organization
- More intuitive controls

---

## Updated Features

### Improved Tracking Logic
- Service Worker now checks for incognito mode: `if (details.incognito) return;`
- Filters new-tab-page: `if (details.url.includes("chrome://newtab")) return;`
- Checks global tracking setting before counting

### Settings Handler
Service Worker now handles settings messages:
```javascript
'getSettings' - Retrieve current settings
'updateSettings' - Update settings with new values
```

### Popup Improvements
- Settings button in header opens settings page
- Delete button for each site in the list
- Better error handling

---

## File Structure (Updated)

```
How Many -Chrome Extension/
├── manifest.json (UPDATED)
│   ├── Added: incognito: "split"
│   └── Added: options_page
├── service-worker/
│   └── service-worker.js (UPDATED)
│       ├── Checks for incognito mode
│       ├── Filters new-tab-page
│       └── Handles settings messages
├── popup/
│   ├── popup.html (UPDATED - added settings button)
│   ├── popup.css (UPDATED - styled settings button & delete icons)
│   └── popup.js (UPDATED - added openSettings & deleteSiteFromList)
├── settings/ (NEW!)
│   ├── settings.html (NEW)
│   ├── settings.css (NEW)
│   └── settings.js (NEW)
├── content-scripts/
│   └── content.js
└── assets/
    └── icon*.png
```

---

## How to Use New Features

### Access Settings
1. Click the extension icon in your toolbar
2. Click the **⚙️** (settings) icon in the top-right
3. Customize your preferences

### Delete a Site from List
1. In the "All Sites" section of the popup
2. Find the site you want to remove
3. Click the **🗑️** button next to the site name
4. Confirm the deletion

### Export Your Data
1. Open Settings (⚙️)
2. Click **📥 Export Data**
3. File downloads as `visit-data-backup-YYYY-MM-DD.json`
4. Keep it safe as a backup

### Clear Everything
1. Open Settings (⚙️)
2. Click **🗑️ Clear All Data**
3. Confirm (⚠️ This cannot be undone!)
4. All visit data will be deleted

---

## Technical Details

### Incognito Mode
- `incognito: "split"` means extension has separate storage in regular and incognito modes
- Incognito mode is completely ignored by tracking
- No data leaks between regular and private browsing

### New Tab Page Filtering
- Checks `details.url.includes("chrome://newtab")`
- Also filters `chrome://` URLs
- Only tracks real website domains

### Settings Storage
```javascript
{
  "settings": {
    "trackingEnabled": true,
    "celebrationEnabled": true
  },
  "visits": { /* ... */ },
  "disabled": [ /* ... */ ],
  "milestones": { /* ... */ }
}
```

---

## Testing Checklist

- [ ] Visiting regular sites increases count
- [ ] Opening new tab does NOT increase count
- [ ] Opening new tab in incognito shows different count (separate storage)
- [ ] Incognito visits don't affect regular browsing data
- [ ] ⚙️ Settings button opens settings page
- [ ] Settings toggles work (save immediately)
- [ ] Export Data downloads JSON backup
- [ ] Clear All Data works and prompts for confirmation
- [ ] Delete button on each site works
- [ ] Delete from current site card still works
- [ ] All sites display correctly after deletion

---

## Known Limitations

- Chrome's `chrome://newtab/` is not the only new tab variant
  - `about:blank` is still skipped
  - Other Chrome internal pages are skipped
- Incognito mode storage is separate (by design)
- Settings page is browser-native (chrome://extensions page style)

---

## What's Coming Next?

Potential future features:
- 📊 Statistics dashboard with charts
- 📅 Time-based analytics (daily, weekly, monthly)
- 🔔 Custom notification sounds
- 📧 Weekly digest emails
- 🎯 Custom milestone targets
- 🌓 Dark mode
- 📱 Mobile sync (if Chrome adds support)

---

## Version History

- **v1.1.0** (Current)
  - Added incognito mode support
  - Added new-tab-page filtering
  - Added settings page
  - Added delete buttons for each site
  - Added export data feature
  - Added clear all data option

- **v1.0.0** (Previous)
  - Initial release
  - Basic visit counting
  - Milestone celebrations
  - Enable/disable per site
  - Reset/delete functions

---

## Support & Feedback

Having issues? Check:
1. Extension is enabled in `chrome://extensions/`
2. Reload extension after any changes
3. Check DevTools console for errors
4. Try clearing extension data (Settings → Clear All Data)

---

**🎉 Enjoy the new features!**
