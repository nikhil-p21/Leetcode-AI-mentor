// scripts/main.js
console.log("LeetCode AI Mentor loaded!");

function init() {
  // Initialize UI first
  window.MentorUI.init();
  
  // Then initialize events
  window.MentorEvents.init();
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}