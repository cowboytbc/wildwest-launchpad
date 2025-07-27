// Quick RPC diagnostic for troubleshooting lock pages
(function() {
  'use strict';
  
  console.log('\n🔍 ========== WILDWEST RPC DIAGNOSTIC ==========');
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  // Check production config status
  console.log('\n📋 PRODUCTION CONFIG STATUS:');
  if (window.PRODUCTION_CONFIG) {
    console.log('✅ PRODUCTION_CONFIG loaded');
    console.log('📍 Source:', window.PRODUCTION_CONFIG.source);
    console.log('⏰ Injected at:', window.PRODUCTION_CONFIG.injectedAt);
    console.log('🔗 Solana RPC:', window.PRODUCTION_CONFIG.rpc?.solana ? 'LOADED' : 'NULL');
    console.log('🔗 Base RPC:', window.PRODUCTION_CONFIG.rpc?.base ? 'LOADED' : 'NULL');
    console.log('🎫 Token:', window.PRODUCTION_CONFIG.token ? 'LOADED' : 'NULL');
  } else {
    console.log('❌ PRODUCTION_CONFIG not loaded');
  }
  
  // Check RPC config status  
  console.log('\n🌐 RPC CONFIG STATUS:');
  if (window.RPC_CONFIG) {
    console.log('✅ RPC_CONFIG loaded');
    // Get endpoints (handle async for Solana)
    const baseEndpoint = window.RPC_CONFIG.getBaseEndpoint();
    console.log('� Base endpoint:', baseEndpoint);
    
    // Handle Solana endpoint async
    window.RPC_CONFIG.getSolanaEndpoint().then(solanaEndpoint => {
      console.log('� Solana endpoint:', solanaEndpoint);
      
      // Check if using fallback endpoints
      if (solanaEndpoint && solanaEndpoint.includes('api.mainnet-beta.solana.com')) {
        console.log('⚠️ Using fallback Solana endpoint (not QuickNode)');
      }
      if (baseEndpoint && baseEndpoint.includes('mainnet.base.org')) {
        console.log('⚠️ Using fallback Base endpoint (not QuickNode)');
      }
    }).catch(error => {
      console.error('❌ Failed to get Solana endpoint:', error);
    });
  } else {
    console.log('❌ RPC_CONFIG not loaded');
  }
  
  // Check wallet status
  console.log('\n💼 WALLET STATUS:');
  if (window.wildWestWallet) {
    console.log('✅ wildWestWallet loaded');
    console.log('🔗 Current chain:', window.wildWestWallet.currentChain || 'none');
    console.log('📍 Account:', window.wildWestWallet.account || 'not connected');
    console.log('🔄 Unified methods active:', !!window.wildWestWallet.originalMethods);
  } else {
    console.log('❌ wildWestWallet not loaded');
  }
  
  console.log('\n🔍 ============ DIAGNOSTIC END ============\n');
  
})();
