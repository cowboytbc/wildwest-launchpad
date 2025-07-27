// Development Configuration
// Provides working endpoints for local testing when GitHub secrets aren't available

(function() {
  'use strict';
  
  // Only load in development (when PRODUCTION_CONFIG is using fallback)
  if (window.PRODUCTION_CONFIG?.source !== 'fallback-development') {
    console.log('🚀 Production mode detected, skipping dev config');
    return;
  }
  
  console.log('🔧 Loading development configuration for local testing');
  
  // Enhanced development configuration with working endpoints
  window.DEV_CONFIG = {
    solana: {
      // Free public endpoints that work for testing
      rpc: 'https://api.mainnet-beta.solana.com',
      fallbacks: [
        'https://rpc.ankr.com/solana',
        'https://solana-api.projectserum.com',
        'https://api.devnet.solana.com' // Devnet for testing
      ],
      // Mock program ID for development (use actual when available)
      lockProgramId: 'LocktDzaV1W2Bm9DeZeiyz4J9zs4fRqNiYqQyracRXw',
      network: 'mainnet-beta' // Change to 'devnet' for testing
    },
    base: {
      rpc: 'https://mainnet.base.org',
      fallbacks: [
        'https://base-rpc.publicnode.com',
        'https://base.blockpi.network/v1/rpc/public'
      ]
    },
    features: {
      enableLogging: true,
      enableTestMode: true,
      skipSecurityChecks: false
    }
  };
  
  // Override RPC_CONFIG for development
  if (window.RPC_CONFIG) {
    console.log('🔄 Overriding RPC_CONFIG for development');
    
    // Update Solana endpoints
    window.RPC_CONFIG.SOLANA.PRIMARY = window.DEV_CONFIG.solana.rpc;
    window.RPC_CONFIG.SOLANA.FALLBACKS = window.DEV_CONFIG.solana.fallbacks;
    
    // Update Base endpoints  
    window.RPC_CONFIG.BASE.PRIMARY = window.DEV_CONFIG.base.rpc;
    
    // Add dev-specific helper
    window.RPC_CONFIG.getDevSolanaEndpoint = function() {
      return window.DEV_CONFIG.solana.rpc;
    };
    
    console.log('✅ Development RPC configuration applied');
    console.log('🔍 Solana endpoint:', window.RPC_CONFIG.SOLANA.PRIMARY);
    console.log('🔍 Base endpoint:', window.RPC_CONFIG.BASE.PRIMARY);
  }
  
  // Add development helpers
  window.DEV_HELPERS = {
    testConnection: async function() {
      console.log('🧪 Testing RPC connections...');
      
      // Test Solana
      try {
        const solanaResponse = await fetch(window.DEV_CONFIG.solana.rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getVersion'
          })
        });
        
        if (solanaResponse.ok) {
          const data = await solanaResponse.json();
          console.log('✅ Solana RPC working:', data.result);
        } else {
          console.error('❌ Solana RPC failed:', solanaResponse.status);
        }
      } catch (error) {
        console.error('❌ Solana RPC error:', error.message);
      }
      
      // Test Base
      try {
        const baseResponse = await fetch(window.DEV_CONFIG.base.rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_chainId'
          })
        });
        
        if (baseResponse.ok) {
          const data = await baseResponse.json();
          console.log('✅ Base RPC working, Chain ID:', data.result);
        } else {
          console.error('❌ Base RPC failed:', baseResponse.status);
        }
      } catch (error) {
        console.error('❌ Base RPC error:', error.message);
      }
    },
    
    enableTestMode: function() {
      console.log('🧪 Enabling test mode for Solana locking');
      window.SOLANA_TEST_MODE = true;
      
      // Override wallet requirements for testing
      if (window.SolanaLockManager) {
        window.SolanaLockManager.prototype.originalCreateLock = window.SolanaLockManager.prototype.createLock;
        window.SolanaLockManager.prototype.createLock = async function(...args) {
          console.log('🧪 Test mode: Creating mock lock transaction');
          // Add test mode logic here if needed
          return this.originalCreateLock.apply(this, args);
        };
      }
    },
    
    showConfig: function() {
      console.log('🔍 Current configuration:');
      console.log('📍 Production Config:', window.PRODUCTION_CONFIG);
      console.log('📍 Dev Config:', window.DEV_CONFIG);
      console.log('📍 RPC Config Solana:', window.RPC_CONFIG?.SOLANA?.PRIMARY);
      console.log('📍 RPC Config Base:', window.RPC_CONFIG?.BASE?.PRIMARY);
    }
  };
  
  // Auto-test connections when loaded
  setTimeout(() => {
    if (window.DEV_CONFIG?.features?.enableLogging) {
      window.DEV_HELPERS.testConnection();
    }
  }, 2000);
  
  console.log('🔧 Development configuration loaded');
  console.log('💡 Use DEV_HELPERS.showConfig() to see current settings');
  console.log('💡 Use DEV_HELPERS.testConnection() to test RPC endpoints');
  console.log('💡 Use DEV_HELPERS.enableTestMode() for enhanced testing');
  
})();
