// Production configuration - Fallback for local development
// This file is overwritten during GitHub Actions deployment with actual secrets

(function() {
  'use strict';
  
  // Check if production config is already loaded
  if (window.PRODUCTION_CONFIG) {
    console.log('🔐 Production config already loaded, skipping fallback');
    return;
  }
  
  // Development/fallback configuration
  window.PRODUCTION_CONFIG = {
    token: null, // No token in development
    rpc: {
      solana: null, // Will fall back to free endpoints
      base: null    // Will fall back to free endpoints
    },
    injectedAt: new Date().toISOString(),
    source: 'fallback-development'
  };
  
  console.log('⚠️ Using fallback production config (development mode)');
  console.log('📍 QuickNode endpoints will be loaded from GitHub Secrets in production');
})();
