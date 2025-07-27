// RPC endpoint configuration for all networks
// Update these with your preferred RPC endpoints

const RPC_CONFIG = {
  // Solana RPC endpoints - MUST use QuickNode from GitHub Secrets
  SOLANA: {
    get PRIMARY() { return window.PRODUCTION_CONFIG?.rpc?.solana; },
    get QUICKNODE() { return window.PRODUCTION_CONFIG?.rpc?.solana; },
    FALLBACKS: [
      "https://solana-mainnet.g.alchemy.com/v2/demo",  // Working endpoint first
      "https://api.mainnet-beta.solana.com",
      "https://rpc.ankr.com/solana",  // Moved to end as it's currently broken
      "https://solana.public-rpc.com"
    ]
  },
  
  // Base/Ethereum RPC endpoints - QuickNode only from GitHub Secrets  
  BASE: {
    get PRIMARY() { return window.PRODUCTION_CONFIG?.rpc?.base; },
    get QUICKNODE() { return window.PRODUCTION_CONFIG?.rpc?.base; },
    FALLBACKS: [
      "https://mainnet.base.org",
      "https://base-mainnet.g.alchemy.com/v2/demo",
      "https://base.gateway.tenderly.co"
    ]
  },
  
  // Connection settings
  SETTINGS: {
    COMMITMENT: "confirmed", // Solana commitment level
    TIMEOUT: 30000, // Connection timeout in ms
  },

  // Price oracle contracts (for future on-chain price fetching)
  PRICE_ORACLES: {
    BASE_ETH_USD: {
      // Chainlink ETH/USD price feed on Base
      address: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
      decimals: 8
    },
    SOLANA_SOL_USD: {
      // Pyth SOL/USD price feed on Solana
      address: "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
      decimals: 9
    }
  },

  // Helper functions to get endpoints
  getSolanaEndpoint: async function() {
    // First priority: QuickNode from GitHub Secrets
    if (this.SOLANA.QUICKNODE) {
      console.log('✅ Using QuickNode Solana endpoint from GitHub Secrets');
      return this.SOLANA.QUICKNODE;
    }
    
    // Fallback: Use public endpoints with testing
    console.warn('⚠️ QuickNode Solana endpoint not available, using fallback');
    try {
      return await this.getSolanaEndpointWithFallback();
    } catch (error) {
      console.warn('⚠️ All fallback endpoints failed, using first fallback');
      return this.SOLANA.FALLBACKS[0];
    }
  },
  
  // Get Solana endpoint with automatic fallback (only used when QuickNode unavailable)
  getSolanaEndpointWithFallback: async function() {
    const endpoints = this.SOLANA.FALLBACKS;
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      try {
        console.log(`🔄 Testing fallback Solana RPC endpoint ${i + 1}/${endpoints.length}: ${endpoint.substring(0, 50)}...`);
        
        // Test the endpoint with a simple getVersion call
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getVersion'
          }),
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result) {
            console.log(`✅ Fallback Solana RPC endpoint working: ${endpoint.substring(0, 50)}...`);
            return endpoint;
          }
        }
      } catch (error) {
        console.log(`❌ Fallback Solana RPC endpoint failed: ${endpoint.substring(0, 50)}... - ${error.message}`);
        continue;
      }
    }
    
    console.error('❌ All fallback Solana RPC endpoints failed, using first anyway');
    return this.SOLANA.FALLBACKS[0];
  },
  
  getBaseEndpoint: function() {
    // First priority: QuickNode from GitHub Secrets
    if (this.BASE.QUICKNODE) {
      console.log('✅ Using QuickNode Base endpoint from GitHub Secrets');
      return this.BASE.QUICKNODE;
    }
    
    // Fallback: Use public endpoints
    console.warn('⚠️ QuickNode Base endpoint not available, using fallback');
    return this.BASE.FALLBACKS[0];
  },
  
  // QuickNode API helpers
  callQuickNodeRPC: async function(endpoint, method, params = []) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: method,
          params: params
        })
      });
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('QuickNode RPC call failed:', error);
      throw error;
    }
  },
  
  // Get ETH price from on-chain oracle (future implementation)
  getETHPriceFromOracle: async function() {
    try {
      // This would query Chainlink price feed on Base using our QuickNode endpoint
      console.log('🔮 Would query ETH price oracle via QuickNode Base endpoint');
      return null; // Placeholder for now
    } catch (error) {
      console.error('ETH price oracle query failed:', error);
      return null;
    }
  },
  
  // Get SOL price from on-chain oracle (future implementation)
  getSOLPriceFromOracle: async function() {
    try {
      // This would query Pyth price feed on Solana using our QuickNode endpoint
      console.log('🔮 Would query SOL price oracle via QuickNode Solana endpoint');
      return null; // Placeholder for now
    } catch (error) {
      console.error('SOL price oracle query failed:', error);
      return null;
    }
  },
  
  // Validate image for banner use
  validateBannerImage: function(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function() {
        const aspectRatio = this.width / this.height;
        const isGoodSize = this.width >= 1200 && this.height >= 150;
        const isGoodRatio = aspectRatio >= 6 && aspectRatio <= 10; // 1500x200 = 7.5 ratio
        
        resolve({
          valid: isGoodSize && isGoodRatio,
          width: this.width,
          height: this.height,
          aspectRatio: aspectRatio,
          recommendations: isGoodSize ? [] : ['Image should be at least 1200x150px'],
          ratioCheck: isGoodRatio ? 'Good' : 'Consider 1500x200px for optimal display'
        });
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = url;
    });
  },
  
  // Get connection object for Solana
  getSolanaConnection: function() {
    if (typeof solanaWeb3 !== 'undefined') {
      return new solanaWeb3.Connection(this.getSolanaEndpoint(), this.SETTINGS.COMMITMENT);
    }
    return null;
  }
};

// Make config globally available
window.RPC_CONFIG = RPC_CONFIG;

console.log('🌐 RPC Configuration loaded:');
if (RPC_CONFIG.BASE.QUICKNODE) {
  console.log('  🔵 Base ETH: QuickNode endpoint from GitHub Secrets ✅');
} else {
  console.log('  🔵 Base ETH: Public fallback endpoint ⚠️');
}

if (RPC_CONFIG.SOLANA.QUICKNODE) {
  console.log('  🟣 Solana: QuickNode endpoint from GitHub Secrets ✅');
} else {
  console.log('  🟣 Solana: Public fallback endpoint ⚠️');
}

if (RPC_CONFIG.BASE.QUICKNODE && RPC_CONFIG.SOLANA.QUICKNODE) {
  console.log('  ⚡ QuickNode infrastructure fully active for high-performance Web3 operations');
} else {
  console.log('  ⚠️ Using public endpoints - QuickNode endpoints not loaded from GitHub Secrets');
}
