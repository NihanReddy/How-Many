let trendChart = null;
let dashboardMode = 'day';
let currentSites = [];
let disabledSites = [];

const rangeSizes = {
    day: 8,
    month: 12,
    year: 15
};

const chartColors = {
    primary: '#1f66dd',
    primarySoft: '#dce8ff',
    primaryStrong: '#0e4fb4',
    surface: '#ffffff',
    grid: 'rgba(216, 224, 240, 0.7)',
    text: '#13213a',
    textMuted: '#5a6783'
};

document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadAllData();
    startAutoRefresh();
});

function setupEventListeners() {
    document.querySelectorAll('.range-btn').forEach(button => {
        button.addEventListener('click', () => {
            dashboardMode = button.dataset.mode || 'day';
            document.querySelectorAll('.range-btn').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            renderDashboard();
        });
    });

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadAllData();
        });
    }

    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    const settingsShortcutBtn = document.getElementById('settingsShortcutBtn');
    if (settingsShortcutBtn) {
        settingsShortcutBtn.addEventListener('click', () => navigateTo('settings'));
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => navigateTo('settings'));
    }

    const openPopupBtn = document.getElementById('openPopupBtn');
    if (openPopupBtn) {
        openPopupBtn.addEventListener('click', () => navigateTo('current-site'));
    }

    const upgradeBtn = document.getElementById('upgradeBtn');
    const upgradeCtaBtn = document.getElementById('upgradeCtaBtn');
    [upgradeBtn, upgradeCtaBtn].forEach(button => {
        if (button) {
            button.addEventListener('click', () => navigateTo('settings'));
        }
    });
}

async function loadAllData() {
    try {
        const data = await chrome.storage.local.get(['visits', 'disabled']);
        disabledSites = Array.isArray(data.disabled) ? data.disabled : [];

        const visits = data.visits || {};
        currentSites = Object.entries(visits)
            .filter(([domain]) => !disabledSites.includes(domain))
            .map(([domain, count]) => ({ domain, count: Number(count) || 0 }))
            .sort((left, right) => right.count - left.count);

        renderDashboard();
    } catch (error) {
        console.error('Error loading analytics data:', error);
        currentSites = [];
        renderDashboard();
    }
}

function renderDashboard() {
    const totalVisits = currentSites.reduce((sum, item) => sum + item.count, 0);
    const uniqueSites = currentSites.length;
    const topSite = currentSites[0] || null;
    const averageVisits = uniqueSites > 0 ? Math.round(totalVisits / uniqueSites) : 0;
    const modeLimit = Math.min(rangeSizes[dashboardMode] || 8, Math.max(currentSites.length, 6));
    const trendData = buildTrendData(currentSites, modeLimit);

    updateKpis({ totalVisits, uniqueSites, topSite, averageVisits, modeLimit });
    renderTrendChart(trendData);
}

function updateKpis({ totalVisits, uniqueSites, topSite, averageVisits, modeLimit }) {
    const totalVisitsEl = document.getElementById('totalVisits');
    const averageVisitsEl = document.getElementById('averageVisits');
    const mostVisitedEl = document.getElementById('mostVisited');
    const uniqueSitesEl = document.getElementById('uniqueSites');
    const trendAverageEl = document.getElementById('trendAverage');
    const mostVisitedMetaEl = document.getElementById('mostVisitedMeta');
    const topSiteProgressEl = document.getElementById('topSiteProgress');
    const visitWindowEl = document.getElementById('visitWindow');
    const avgSessionEl = document.getElementById('avgSession');
    const bounceRateEl = document.getElementById('bounceRate');
    const topSourceEl = document.getElementById('topSource');
    const visitGrowthEl = document.getElementById('visitGrowth');

    if (totalVisitsEl) totalVisitsEl.textContent = formatNumber(totalVisits);
    if (averageVisitsEl) averageVisitsEl.textContent = formatNumber(averageVisits);
    if (mostVisitedEl) mostVisitedEl.textContent = topSite ? formatDomain(topSite.domain) : '—';
    if (uniqueSitesEl) uniqueSitesEl.textContent = `${formatNumber(uniqueSites)} tracked domains`;
    if (trendAverageEl) trendAverageEl.textContent = `Avg: ${formatNumber(averageVisits)} / day`;

    if (mostVisitedMetaEl) {
        mostVisitedMetaEl.textContent = topSite
            ? `${formatNumber(topSite.count)} total visits` 
            : 'No data yet';
    }

    if (topSiteProgressEl) {
        const ratio = totalVisits > 0 && topSite ? Math.max(6, Math.round((topSite.count / totalVisits) * 100)) : 0;
        topSiteProgressEl.style.width = `${ratio}%`;
    }

    if (visitWindowEl) {
        const windowLabel = dashboardMode === 'day' ? 'This day' : dashboardMode === 'month' ? 'This month' : 'This year';
        visitWindowEl.textContent = windowLabel;
    }

    if (avgSessionEl) {
        avgSessionEl.textContent = uniqueSites > 0 ? `${formatNumber(totalVisits)} total` : '0 total';
    }

    if (bounceRateEl) {
        bounceRateEl.textContent = '--';
    }

    if (topSourceEl) {
        topSourceEl.textContent = topSite ? formatDomain(topSite.domain) : 'Direct';
    }

    if (visitGrowthEl) {
        if (topSite && totalVisits > 0) {
            const share = Math.round((topSite.count / totalVisits) * 100);
            visitGrowthEl.textContent = share + '% of visits';
            visitGrowthEl.classList.add('positive');
        } else {
            visitGrowthEl.textContent = '0% of visits';
            visitGrowthEl.classList.add('positive');
        }
    }
}

function buildTrendData(data, limit) {
    const limited = data.slice(0, Math.max(6, limit));

    if (limited.length === 0) {
        return {
            labels: ['No data'],
            values: [0]
        };
    }

    const labels = limited.map((item, index) => {
        if (limited.length <= 6) {
            return formatDomain(item.domain);
        }

        const shortLabel = formatDomain(item.domain);
        return shortLabel.length > 12 ? `${shortLabel.slice(0, 11)}…` : shortLabel;
    });

    const values = limited.map((item) => {
        return Math.max(0, item.count);
    });

    return { labels, values };
}

function renderTrendChart(trendData) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) {
        return;
    }

    const context = canvas.getContext('2d');
    if (trendChart) {
        trendChart.destroy();
    }

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height || 330);
    gradient.addColorStop(0, 'rgba(31, 102, 221, 0.30)');
    gradient.addColorStop(0.55, 'rgba(31, 102, 221, 0.14)');
    gradient.addColorStop(1, 'rgba(31, 102, 221, 0.01)');

    trendChart = new Chart(context, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Visits',
                data: trendData.values,
                borderColor: chartColors.primary,
                backgroundColor: gradient,
                fill: true,
                borderWidth: 2,
                tension: 0.45,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 650,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(19, 33, 58, 0.92)',
                    padding: 12,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label(context) {
                            return `${formatNumber(context.parsed.y)} visits`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(216, 224, 240, 0.45)',
                        drawBorder: false
                    },
                    ticks: {
                        color: chartColors.textMuted,
                        font: {
                            size: 11,
                            weight: '600'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: chartColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: chartColors.textMuted,
                        font: {
                            size: 11,
                            weight: '600'
                        },
                        callback(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function navigateTo(page) {
    const routes = {
        'current-site': 'popup/popup.html',
        analytics: 'analytics/analytics.html',
        settings: 'settings/settings.html',
        history: 'popup/popup.html'
    };

    const route = routes[page];
    if (!route) {
        return;
    }

    window.location.href = chrome.runtime.getURL(route);
}

function formatDomain(domain) {
    return String(domain || '').replace(/^www\./, '').replace(/\/$/, '');
}

function formatNumber(value) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }

    return String(value);
}

let refreshInterval = null;

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        loadAllData();
    }, 30000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Only poll when visible — pause when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        loadAllData(); // Fresh data on return
        startAutoRefresh();
    }
});
// Auto-refresh started inside DOMContentLoaded to avoid double load
