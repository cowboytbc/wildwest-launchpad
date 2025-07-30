// Production Configuration
// This file is automatically populated during GitHub Actions deployment
// with environment variables from GitHub Secrets for security

window.PRODUCTION_CONFIG = {
  // Will be populated by GitHub Actions with:
  // - QuickNode RPC endpoints
  // - API keys and secrets
  // - Environment-specific configuration
};

// Check if this is running without GitHub Secrets (mobile wallet browsers, local dev)
// If PRODUCTION_CONFIG is empty, mark as fallback mode so dev-config.js can provide working endpoints
setTimeout(() => {
  if (!window.PRODUCTION_CONFIG.rpc && !window.PRODUCTION_CONFIG.hasSecrets) {
    console.log('🔄 GitHub Secrets not available - enabling fallback development mode');
    window.PRODUCTION_CONFIG.source = 'fallback-development';
    window.PRODUCTION_CONFIG.hasSecrets = false;
    
    // Trigger a custom event to let other scripts know we're in fallback mode
    if (typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('production-config-fallback', {
        detail: { source: 'fallback-development' }
      }));
    }
  } else {
    console.log('✅ GitHub Secrets available - using production configuration');
    window.PRODUCTION_CONFIG.hasSecrets = true;
  }
}, 100);
