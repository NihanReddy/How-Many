// Content script - runs on every page
// Notifies background about page loads (service worker already tracks via webNavigation)
// This can be enhanced for additional tracking features if needed

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  // Page has loaded - tracking handled by service worker
  // This script can be used for additional functionality in the future
}
