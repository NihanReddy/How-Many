// Chart instances
let topVisitsChart, pieChart, columnChart;

// Chart colors aligned with Material Design
const chartColors = {
    primary: '#006a61',
    primaryLight: '#86f2e4',
    secondary: '#4edea3',
    tertiary: '#89f5e7',
    accent1: '#bec6e0',
    accent2: '#dae2fd',
    accent3: '#565e74',
    accent4: '#5a7396',
    error: '#ba1a1a',
    warning: '#ee8b60',
    info: '#3b6e80'
};

const colorPalette = [
    chartColors.primary,
    chartColors.accent4,
    chartColors.accent3,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.accent1,
    chartColors.accent2,
    '#00897b',
    '#00695c',
    '#004d40',
    '#1b5e20',
    '#558b2f',
    '#f57f17',
    '#e65100',
    '#bf360c'
];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    setupEventListeners();
});

function setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchChart(btn.dataset.chart);
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        location.reload();
    });

    // Sidebar navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function switchChart(chartName) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-chart="${chartName}"]`).classList.add('active');

    // Update active section
    document.querySelectorAll('.chart-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${chartName}-section`).classList.add('active');

    // Trigger resize for charts
    setTimeout(() => {
        if (topVisitsChart) topVisitsChart.resize();
        if (pieChart) pieChart.resize();
        if (columnChart) columnChart.resize();
    }, 100);
}

async function loadAllData() {
    try {
        const data = await chrome.storage.local.get(['visits', 'disabled', 'milestones']);
        const visits = data.visits || {};

        // Filter out disabled sites
        const enabledVisits = {};
        Object.keys(visits).forEach(domain => {
            if (!data.disabled || !data.disabled.includes(domain)) {
                enabledVisits[domain] = visits[domain];
            }
        });

        // Sort by visit count
        const sortedData = Object.entries(enabledVisits)
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count);

        // Create charts
        createBarChart(sortedData.slice(0, 10));
        createPieChart(sortedData.slice(0, 8));
        createColumnChart(sortedData.slice(0, 15));
        updateStatistics(sortedData);
        updateTable(sortedData);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function createBarChart(data) {
    const ctx = document.getElementById('topVisitsChart').getContext('2d');

    if (topVisitsChart) {
        topVisitsChart.destroy();
    }

    topVisitsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => formatDomain(d.domain)),
            datasets: [{
                label: 'Visits',
                data: data.map(d => d.count),
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primaryLight,
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: chartColors.accent4,
                hoverBorderColor: chartColors.primary,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return formatNumber(context.parsed.x) + ' visits';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 12 },
                        color: '#45464d',
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    grid: {
                        drawBorder: false,
                        color: 'rgba(198, 198, 205, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        font: { size: 12, weight: '500' },
                        color: '#191c1e'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');

    if (pieChart) {
        pieChart.destroy();
    }

    const colors = colorPalette.slice(0, data.length);

    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => formatDomain(d.domain)),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return formatNumber(context.parsed) + ' visits (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });

    // Update legend
    updatePieLegend(data, colors);
}

function updatePieLegend(data, colors) {
    const legendContainer = document.getElementById('pieLegend');
    const total = data.reduce((sum, d) => sum + d.count, 0);

    legendContainer.innerHTML = data.map((d, i) => {
        const percentage = ((d.count / total) * 100).toFixed(1);
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[i]}"></div>
                <div class="legend-text">${formatDomain(d.domain)}</div>
                <div class="legend-value">${percentage}%</div>
            </div>
        `;
    }).join('');
}

function createColumnChart(data) {
    const ctx = document.getElementById('columnChart').getContext('2d');

    if (columnChart) {
        columnChart.destroy();
    }

    const colors = colorPalette.slice(0, data.length);

    columnChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => formatDomain(d.domain)),
            datasets: [{
                label: 'Visits',
                data: data.map(d => d.count),
                backgroundColor: colors,
                borderColor: colors.map(c => adjustBrightness(c, -20)),
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: colors.map(c => adjustBrightness(c, 15)),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return formatNumber(context.parsed.y) + ' visits';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 12 },
                        color: '#45464d',
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    },
                    grid: {
                        drawBorder: false,
                        color: 'rgba(198, 198, 205, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11, weight: '500' },
                        color: '#191c1e'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateStatistics(data) {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const unique = data.length;
    const average = unique > 0 ? Math.round(total / unique) : 0;
    const most = data.length > 0 ? data[0] : null;

    document.getElementById('totalVisits').textContent = formatNumber(total);
    document.getElementById('uniqueSites').textContent = unique;
    document.getElementById('mostVisited').textContent = most ? formatDomain(most.domain) : '—';
    document.getElementById('averageVisits').textContent = formatNumber(average);
}

function updateTable(data) {
    const tbody = document.getElementById('sitesTableBody');
    const total = data.reduce((sum, d) => sum + d.count, 0);

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No data yet. Start browsing!</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((d, i) => {
        const percentage = ((d.count / total) * 100).toFixed(1);
        return `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${formatDomain(d.domain)}</strong></td>
                <td>${formatNumber(d.count)}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }).join('');
}

// Utility Functions
function formatDomain(domain) {
    return domain.replace(/^www\./, '').replace(/\/$/, '');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function goBack() {
    window.history.back();
}

function navigateTo(page) {
    const pages = {
        'current-site': 'popup/popup.html',
        'analytics': 'analytics/analytics.html',
        'history': '#history',
        'settings': 'settings/settings.html'
    };

    if (pages[page]) {
        if (pages[page].startsWith('#')) {
            console.log('Page not yet implemented:', page);
        } else {
            chrome.runtime.getURL(pages[page]);
            window.location.href = pages[page];
        }
    }
}

// Auto-refresh data every 30 seconds
setInterval(async () => {
    await loadAllData();
}, 30000);
