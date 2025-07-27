// PRODUCTION CONFIG - QuickNode endpoints active
(function() {
  'use strict';
  
  if (window.PRODUCTION_CONFIG) {
    console.log('🔐 Production config already loaded');
    return;
  }
  
  // QuickNode endpoints - high performance RPC
  window.PRODUCTION_CONFIG = {
    rpc: {
      solana: 'https://withered-divine-spring.solana-mainnet.quiknode.pro/0ef60836be4b1b1fea3b948cf28c518322a18147/',
      base: 'https://responsive-omniscient-model.base-mainnet.quiknode.pro/aa86b92100862c55985ff1d322a9ff07d9ab236f/'
    },
    injectedAt: new Date().toISOString(),
    source: 'quicknode-direct-commit'
  };
  
  window.RPC_CONFIG = {
    getSolanaEndpoint: function() {
      if (!window.PRODUCTION_CONFIG || !window.PRODUCTION_CONFIG.rpc.solana) {
        throw new Error('CRITICAL: QuickNode Solana endpoint not available.');
      }
      return window.PRODUCTION_CONFIG.rpc.solana;
    },
    getBaseEndpoint: function() {
      if (!window.PRODUCTION_CONFIG || !window.PRODUCTION_CONFIG.rpc.base) {
        throw new Error('CRITICAL: QuickNode Base endpoint not available.');
      }
      return window.PRODUCTION_CONFIG.rpc.base;
    }
  };
  
  console.log('🚀 QuickNode production config loaded successfully');
  console.log('⚡ High-performance RPC endpoints active');
})();
