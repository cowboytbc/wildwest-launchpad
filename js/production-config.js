// Production configuration placeholder - Will be updated by GitHub Actions
(function() {
  'use strict';
  
  if (window.PRODUCTION_CONFIG) {
    console.log('🔐 Production config already loaded');
    return;
  }
  
  // Default fallback configuration (will be overwritten by GitHub Actions)
  window.PRODUCTION_CONFIG = {
    rpc: {
      solana: null,
      base: null
    },
    injectedAt: new Date().toISOString(),
    source: 'fallback-placeholder'
  };
  
  console.log('⚠️ Using fallback production config - GitHub Secrets not injected');
  console.log('📊 This file will be updated by GitHub Actions during deployment');
})();
