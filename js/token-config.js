// Production token configuration - injected at build time
// This file will be overwritten during GitHub Actions deployment

window.PRODUCTION_CONFIG = {
  token: null, // Will be injected during build
  environment: 'development'
};

console.log('🔧 Token config loaded (will be replaced in production)');
