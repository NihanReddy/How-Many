# How Many - Chrome Extension 📊

A Chrome extension that counts how many times you visit each website, with celebration notifications at 1 million and 10 million visits!

## Features 🎯

- ✅ **Automatic Visit Tracking** - Automatically counts every page visit per domain
- 📊 **Visit Counter Display** - View visit counts in a beautiful popup
- 🎉 **Milestone Celebrations** - Get notifications at 1M and 10M visits
- 🔄 **Reset Counter** - Reset the visit count for any site to 0
- ⛔ **Disable Tracking** - Stop counting visits for specific sites
- 🗑️ **Delete Data** - Completely remove tracking data for a site
- 📈 **All Sites View** - See all tracked sites with their visit counts
- 💾 **Persistent Storage** - Data syncs across your devices

## Installation

1. Download or clone this extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked** and select this extension folder
5. The extension will appear in your Chrome toolbar!

## How to Use

### View Current Site Stats
1. Click the **How Many** extension icon in your toolbar
2. See the visit count for the current website
3. View all your tracked sites

### Controls

#### Current Site Card
- **🔄 Reset** - Reset visit count to 0 for this site
- **⛔ Disable** - Stop tracking this site (button becomes ✅ Enable to re-enable)
- **🗑️ Delete** - Permanently delete all data for this site

#### All Sites Section
- Browse all your tracked websites
- Click **📈** to sort (cycles through sort orders)
- See milestone badges for 1M 🎉 and 10M 🚀 achievements
- Sites with tracking disabled show a ⚠️ DISABLED badge

### Milestone Celebrations 🎊

The extension will show a system notification when you reach:
- **1,000,000 visits** 🎉 on any domain
- **10,000,000 visits** 🚀 on any domain

These milestones are tracked per domain and only trigger once.

## Data Storage

All data is stored locally using Chrome's Storage API:

```
{
  "visits": {
    "example.com": 150,
    "github.com": 500
  },
  "disabled": ["ads.com"],
  "milestones": {
    "github.com": [1000000]  // completed milestones
  }
}
```

## Privacy & Security 🔒

- ✅ All data is stored **locally** on your device
- ✅ No data is sent to external servers
- ✅ No tracking or analytics collection
- ✅ Chrome notification permission needed for milestone alerts
- ✅ Web Navigation permission needed to detect page loads

## Technical Details

- **Architecture**: Manifest V3 (latest Chrome extension standard)
- **Background Script**: Service Worker for efficient tracking
- **Storage**: Chrome Storage API (syncs across devices if logged in)
- **Content Script**: Minimal - relies on webNavigation API
- **Popup**: 500px width with responsive design

## File Structure

```
How Many -Chrome Extension/
├── manifest.json                    # Extension configuration
├── service-worker/
│   └── service-worker.js           # Background tracking logic
├── popup/
│   ├── popup.html                  # Popup UI
│   ├── popup.css                   # Styles
│   └── popup.js                    # Popup logic
├── content-scripts/
│   └── content.js                  # Content script (minimal)
└── assets/
    ├── icon16.png                  # 16x16 icon
    ├── icon48.png                  # 48x48 icon
    └── icon128.png                 # 128x128 icon
```

## Troubleshooting

### Extension not tracking visits
- Make sure you have the extension enabled in `chrome://extensions/`
- Check that you've reloaded the extension after making changes
- Visit counts only increase on page navigation (hard refresh), not page reload

### Icons not showing
- Icon placeholders are minimal. To add custom icons:
  1. Create 16x16, 48x48, and 128x128 PNG images
  2. Replace files in the `assets/` folder
  3. Reload the extension

### Data not persisting
- Check that you haven't cleared Chrome's storage
- Verify storage permissions are granted to the extension
- Try viewing `chrome://extensions/` and checking extension details

## Future Enhancements 🚀

- [ ] Export visit data as CSV
- [ ] Import visit data from backup
- [ ] Custom milestone thresholds
- [ ] Time-based analytics (visits per day/week/month)
- [ ] Dark mode
- [ ] Site-specific notes
- [ ] Statistics and charts
- [ ] Weekly digest emails

## Version History

- **v1.0.0** - Initial release
  - Visit counting
  - Milestone celebrations
  - Enable/disable tracking
  - Reset and delete functions

## License

Open source - feel free to modify and distribute!

---

**Enjoy tracking your web browsing! 🌐📊**
