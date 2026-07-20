# Customization Guide 🎨

## Modify Milestone Thresholds

Edit `service-worker/service-worker.js` and find this section (around line 28):

```javascript
const celebrationMilestones = [1000000, 10000000];
```

Change to any values you want:

```javascript
// Example: Celebrate at 100, 1K, 10K
const celebrationMilestones = [100, 1000, 10000];

// Example: Just 1 million
const celebrationMilestones = [1000000];

// Example: More granular milestones
const celebrationMilestones = [100, 500, 1000, 10000, 100000, 1000000];
```

Then reload the extension on `chrome://extensions/`.

## Customize Celebration Messages

In `service-worker/service-worker.js`, modify the `showCelebration()` function:

```javascript
async function showCelebration(domain, count) {
  const messages = {
    100: "🎯 100 times! Not bad!",
    1000: "🔥 1,000 times! You like this site!",
    10000: "⭐ 10,000 times! Power user!",
    1000000: "🎉 1 MILLION TIMES! LEGEND! 🎉",
    10000000: "🚀 10 MILLION! You're a GOD! 🚀"
  };

  const message = messages[count] || `You've visited ${domain} ${count} times!`;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/icon128.png',
    title: '🎊 Milestone Achievement!',
    message: message,
    priority: 2
  });
}
```

## Change Popup Colors

Edit `popup/popup.css` to customize the gradient and colors:

```css
/* Current purple gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Try other gradients: */

/* Blue gradient */
background: linear-gradient(135deg, #667eea 0%, #0084ff 100%);

/* Green gradient */
background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);

/* Orange gradient */
background: linear-gradient(135deg, #f93b1d 0%, #ea1e63 100%);

/* Pink gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Dark gradient */
background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
```

Also customize accent colors:

```css
.number {
    color: #667eea;  /* Change this to match your gradient */
}
```

## Change Popup Size

Edit `popup/popup.css`:

```css
.container {
    width: 500px;      /* Default width */
    max-height: 600px; /* Default max height */
}

/* Make it wider and taller */
.container {
    width: 700px;
    max-height: 800px;
}

/* Make it more compact */
.container {
    width: 350px;
    max-height: 500px;
}
```

## Add More Site Information

Modify `popup/popup.js` to show additional stats:

```javascript
// In loadAllSiteStats(), add percentage of total visits:
const totalVisits = stats.reduce((sum, s) => sum + s.count, 0);

sitesList.innerHTML = stats.map(site => {
  const percentage = totalVisits > 0 ? ((site.count / totalVisits) * 100).toFixed(1) : 0;
  return `
    <div class="site-item">
      <div class="site-info">
        <div class="site-item-name">${escapeHtml(site.domain)}</div>
        <div class="site-item-count">
          ${formatCount(site.count)} visits (${percentage}% of total)
        </div>
      </div>
    </div>
  `;
}).join('');
```

## Add Dark Mode

Add to `popup/popup.css`:

```css
@media (prefers-color-scheme: dark) {
    body {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    .container {
        background: #0f3460;
        color: #eee;
    }
    
    .site-card {
        background: #1a1a2e;
        border-color: #16213e;
        color: #eee;
    }
    
    .site-name {
        color: #eee;
    }
    
    /* Add more dark mode overrides... */
}
```

## Create Custom Icons

Replace placeholder icons with your own:

1. Create 16x16, 48x48, and 128x128 PNG images
2. Save as:
   - `assets/icon16.png`
   - `assets/icon48.png`
   - `assets/icon128.png`
3. Reload extension on `chrome://extensions/`

**Quick way with online tools:**
- Use [favicon-generator.org](https://www.favicon-generator.org/)
- Or any online PNG editor (e.g., Pixlr)

## Modify Notification Style

In `service-worker/service-worker.js`:

```javascript
chrome.notifications.create({
    type: 'basic',        // or 'image', 'list', 'progress'
    iconUrl: 'assets/icon128.png',
    title: 'Your Title',
    message: 'Your message',
    priority: 2,          // 0-2
    buttons: [            // Add buttons!
        {title: 'View', iconUrl: '...'},
        {title: 'Share', iconUrl: '...'}
    ]
});
```

## Skip Tracking Certain Domains

In `service-worker/service-worker.js`, add domains to skip:

```javascript
const skipDomains = [
    'chrome://',
    'edge://',
    'localhost',
    'ads.com',
    'tracker.com'
];

// Then in onCompleted handler:
if (skipDomains.some(skip => domain.includes(skip))) return;
```

## Export Your Data

Add this to `popup/popup.js`:

```javascript
async function exportData() {
    const data = await chrome.storage.local.get();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visit-data-backup.json';
    a.click();
}

// Add button to HTML and call exportData()
```

---

**Tip:** Always reload the extension (`chrome://extensions/` → Reload) after making changes!
