// Production token configuration - injected at build time
// This file will be overwritten during GitHub Actions deployment

window.PRODUCTION_CONFIG = {
  token: null, // Will be injected during build
  environment: 'development'
};

// Fallback token detection for when GitHub Actions injection fails
window.getProductionToken = function() {
  // Check if GitHub Actions successfully injected the token
  if (window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.token && window.PRODUCTION_CONFIG.token !== null) {
    return window.PRODUCTION_CONFIG.token;
  }
  
  // If you need immediate functionality, uncomment and add your token here:
  // return "ghp_your_github_token_here";
  
  return null;
};

// Auto-detect and fix missing token
(function() {
  const fallbackToken = window.getProductionToken();
  if (fallbackToken && window.PRODUCTION_CONFIG) {
    window.PRODUCTION_CONFIG.token = fallbackToken;
    window.PRODUCTION_CONFIG.environment = 'production';
    console.log('🔧 Using fallback token detection');
  }
})();

console.log('🔧 Token config loaded (will be replaced in production)');
