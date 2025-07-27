// console-filter.js - Universal console filter for Wild West Launchpad
// This script filters out development noise while preserving important logs

(function() {
  'use strict';
  
  // Check localStorage for user preference (default: OFF = filtered/clean mode)
  window.SHOW_DEBUG_LOGS = localStorage.getItem('SHOW_DEBUG_LOGS') === 'true';
  
  if (!window.SHOW_DEBUG_LOGS) {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Filter out common development noise
    const filterPatterns = [
      // Config and debug messages
      /Environment: DEVELOPMENT/,
      /window\.SECURE_CONFIG exists/,
      /window\.ENV_CONFIG exists/,
      /PRODUCTION_CONFIG\.token available/,
      /Available window properties/,
      /Debug: process\.env exists/,
      /Service-wide GitHub configuration loaded/,
      /Development environment detected/,
      /Development environment configuration applied/,
      /dev-token-inject\.js/,
      /Service GitHub token not configured/,
      /Service not ready.*GitHub token/,
      /Using fallback token detection/,
      /Available globals/,
      /Token config loaded.*will be replaced in production/,
      /SecureConfig Debug Info/,
      /Using fallback token detection/,
      /Service GitHub token not configured.*uploads unavailable/,
      /Debug: window\.ENV_CONFIG exists/,
      /Debug: process\.env exists/,
      /Service not ready.*GitHub token not configured/,
      /Service-wide GitHub configuration loaded/,
      
      // Payment and API messages
      /Payment config loaded.*QuickNode/,
      /GitHubActionsUploader loaded/,
      /GitHub Image Uploader loaded/,
      /RPC Configuration loaded.*QuickNode/,
      /Base ETH: https/,
      /Solana: https.*alchemy/,
      /QuickNode infrastructure ready/,
      /Banner configuration loaded/,
      /Payment system ready.*QuickNode/,
      /Price update from our infrastructure/,
      /Accepting ETH on Base network/,
      /Accepting SOL on Solana network/,
      /QuickNode endpoints configured/,
      /Fetching crypto prices.*QuickNode/,
      /Initializing payment system.*QuickNode/,
      /Payment config loaded.*ETH.*SOL payments via QuickNode/,
      /GitHub Image Uploader loaded.*admin panel integration/,
      /RPC Configuration loaded with QuickNode endpoints/,
      /QuickNode infrastructure ready for high-performance/,
      /QuickNode endpoints configured for optimal performance/,
      /Fetching crypto prices via QuickNode infrastructure/,
      /Payment system ready with QuickNode infrastructure/,
      /Initializing payment system with QuickNode infrastructure/,
      /Accepting ETH on Base network via QuickNode RPC/,
      /Accepting SOL on Solana network via QuickNode RPC/,
      
      // Banner system messages  
      /Banner functions:/,
      /Updated functions:/,
      /Refresh function:/,
      /Additional functions:/,
      /URL testing:/,
      /Test functions available/,
      /createTestBanners/,
      /clearTestBanners/,
      /setGitHubToken/,
      /debugGitHubAPI/,
      /deleteBottomBanners/,
      /forceRefreshBanners/,
      /inspectBottomBanner/,
      /Initializing Banner Rotation System/,
      /Pricing: Top Banner/,
      /Rotation interval:/,
      /Immediate activation:/,
      /Fetching banners from GitHub/,
      /Local development.*using GitHub API/,
      /Using direct GitHub API/,
      /Decoded banner URL/,
      /Processed \d+ top banners/,
      /Top banner click handler attached/,
      /Bottom Banner Retrieved/,
      /Bottom banner click handler attached/,
      /Banners updated:/,
      /Top Banner Details:/,
      /Banner rotation timer started/,
      /Banner rotation system initialized/,
      
      // Wallet system initialization (keep connection logs, filter setup noise)
      /DOMContentLoaded.*initializing wallet/,
      /Cleared any pending connection states/,
      /wildWestWallet.*available.*initializing/,
      /wildWestWallet initialized and made globally available/,
      /Wallet initialization debug/,
      /connectBtn found/,
      /disconnectBtn found/,
      /walletDropdownMenu found/,
      /window\.wildWestWallet exists/,
      /Setting up wallet connection button/,
      /Initializing secure configuration/,
      /SECURE_CONFIG already available/,
      /Banner admin declared wallet button ownership/,
      /Banner admin page is handling wallet button.*skipping/,
      /Creating WildWestWallet instance/,
      /Using existing global wildWestWallet instance/,
      /Wallet instance created successfully/,
      /Wallet initialization complete/,
      /Dependencies loaded.*initializing wallet/,
      
      // Debug function availability messages
      /Debug function available/,
      /Payment system loaded.*initializing display/,
      /Banner admin page loaded/,
      /script\.js:.*wallet\.js is handling/,
      /Banner admin page loaded.*initializing/,
      /No wallet connected.*must pay regular price/,
      /Payment calculation.*both currencies/,
      /Payment system loaded.*initializing display/,
      
      // CORS and API errors
      /Access to fetch.*CORS policy/,
      /Failed to load resource.*api\.coingecko/,
      /Failed to fetch crypto prices/,
      /Using QuickNode RPC endpoints for backup/,
      /Attempting price fetch via QuickNode/,
      /Using fallback prices.*QuickNode/,
      
      // Old emoji patterns (for compatibility)
      /🔧 Token config/,
      /🔍 SecureConfig Debug/,
      /⚠️ Using fallback token/,
      /📍 Available globals/,
      /❌ Service GitHub token/,
      /🔍 Debug: window\.ENV_CONFIG/,
      /⚠️ Service not ready/,
      /💰 Fetching crypto prices/,
      /📡 Using QuickNode RPC endpoints/,
      /🔄 Attempting price fetch/,
      /🛠️ Development environment detected/,
      /🔧 Development environment configuration/,
      /💡 Banner functions/,
      /💡 Updated functions/,
      /💡 Refresh function/,
      /💡 Additional functions/,
      /💡 URL testing/,
      /🧪 Test functions available/,
      /💳 Initializing payment system/,
      /🔵 Accepting ETH/,
      /🟣 Accepting SOL/,
      /📡 QuickNode endpoints configured/,
      /🎯 Starting banner rotation/,
      /🎯 Initializing Banner Rotation/,
      /🔄 Rotation interval/,
      /🚀 Immediate activation/,
      /📡 Fetching banners from GitHub/,
      /🔄 Fetching banners from GitHub/,
      /🔧 Local development/,
      /🌐 Using direct GitHub API/,
      /🔄 Fetching banners from GitHub API/,
      /✅ Price update from our infrastructure/,
      /✅ Payment system ready/,
      /🔗 Decoded banner URL/,
      /✅ Processed.*banners from GitHub/,
      /🖱️.*banner click handler attached/,
      /🔍.*Banner Retrieved/,
      /🔄 Banners updated/,
      /🔍.*Banner Details/,
      /⏰ Banner rotation timer started/,
      /✅ Banner rotation system initialized/,
      
      // Additional emoji patterns from current logs
      /🔧 Token config loaded.*will be replaced in production/,
      /🔍 SecureConfig Debug Info/,
      /🚫 Banner admin declared wallet button ownership/,
      /🔧 GitHub Image Uploader loaded.*admin panel integration/,
      /🌐 RPC Configuration loaded with QuickNode endpoints/,
      /🔵 Base ETH: https/,
      /🟣 Solana: https/,
      /⚡ QuickNode infrastructure ready/,
      /🎯 Banner configuration loaded/,
      /💡 Debug function available/,
      /💳 Payment config loaded.*ETH.*SOL payments/,
      /🔄 DOMContentLoaded.*initializing wallet/,
      /📄 Banner admin page loaded/,
      /💰 Payment calculation.*both currencies/,
      /✅ Payment system loaded.*initializing display/
    ];
    
    console.log = function(...args) {
      const message = args.join(' ');
      if (!filterPatterns.some(pattern => pattern.test(message))) {
        originalLog.apply(console, args);
      }
    };
    
    console.warn = function(...args) {
      const message = args.join(' ');
      if (!filterPatterns.some(pattern => pattern.test(message))) {
        originalWarn.apply(console, args);
      }
    };
    
    console.error = function(...args) {
      const message = args.join(' ');
      // Allow important errors through, filter CORS/API errors
      if (!filterPatterns.some(pattern => pattern.test(message))) {
        originalError.apply(console, args);
      }
    };
  }
  
  // Log that the filter has been applied (or not)
  if (window.SHOW_DEBUG_LOGS) {
    console.log('🔍 Console filter: DEBUG MODE - All messages visible');
  } else {
    console.log('🧹 Console filter: CLEAN MODE - Development noise filtered');
  }
})();
