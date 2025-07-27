// RPC endpoint configuration for all networks
// Update these with your preferred RPC endpoints

const RPC_CONFIG = {
  // Solana RPC endpoints - QuickNode PRIORITY
  SOLANA: {
    get PRIMARY() { 
      // Use QuickNode from production config if available
      return window.PRODUCTION_CONFIG?.rpc?.solana || this.getQuickNodeEndpoint();
    },
    get QUICKNODE() { 
      return window.PRODUCTION_CONFIG?.rpc?.solana || this.getQuickNodeEndpoint();
    },
    // Direct QuickNode endpoint for development/backup
    getQuickNodeEndpoint() {
      return 'https://withered-divine-spring.solana-mainnet.quiknode.pro/0ac83d6b4ecf2a8fa8d0a6894210ede33b1b7495/';
    },
    FALLBACKS: [
      "https://api.mainnet-beta.solana.com", // Official Solana RPC (rate limited)
      "https://solana-api.projectserum.com", // Serum project endpoint  
      "https://api.metaplex.solana.com",     // Metaplex endpoint
    ]
  },
  
  // Base/Ethereum RPC endpoints - QuickNode PRIORITY
  BASE: {
    get PRIMARY() { 
      // Use QuickNode from production config if available
      return window.PRODUCTION_CONFIG?.rpc?.base || this.getQuickNodeEndpoint();
    },
    get QUICKNODE() { 
      return window.PRODUCTION_CONFIG?.rpc?.base || this.getQuickNodeEndpoint();
    },
    // Direct QuickNode endpoint for development/backup
    getQuickNodeEndpoint() {
      return 'https://responsive-omniscient-model.base-mainnet.quiknode.pro/d9b8b93b1b8b7cc6b8993c4ef5c6e7a70a6e9ad8/';
    },
    FALLBACKS: [
      "https://mainnet.base.org",
      "https://base.blockpi.network/v1/rpc/public",
      "https://base-mainnet.public.blastapi.io"
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
    // Priority 1: QuickNode from GitHub Secrets (production)
    if (this.SOLANA.QUICKNODE && window.PRODUCTION_CONFIG?.rpc?.solana) {
      console.log('🔐 Using QuickNode Solana endpoint from GitHub Secrets');
      return this.SOLANA.QUICKNODE;
    }
    
    // Priority 2: Direct QuickNode endpoint (development/backup)
    const directQuickNode = this.SOLANA.getQuickNodeEndpoint();
    console.log('⚡ Using direct QuickNode Solana endpoint');
    return directQuickNode;
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
    // Priority 1: QuickNode from GitHub Secrets (production)
    if (this.BASE.QUICKNODE && window.PRODUCTION_CONFIG?.rpc?.base) {
      console.log('🔐 Using QuickNode Base endpoint from GitHub Secrets');
      return this.BASE.QUICKNODE;
    }
    
    // Priority 2: Direct QuickNode endpoint (development/backup)
    const directQuickNode = this.BASE.getQuickNodeEndpoint();
    console.log('⚡ Using direct QuickNode Base endpoint');
    return directQuickNode;
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

// Check if we have GitHub Secrets (production) or using direct endpoints (development)
const hasGitHubSecrets = window.PRODUCTION_CONFIG?.rpc?.solana && window.PRODUCTION_CONFIG?.rpc?.base;

if (hasGitHubSecrets) {
  console.log('  🔵 Base ETH: QuickNode endpoint from GitHub Secrets ✅');
  console.log('  � Solana: QuickNode endpoint from GitHub Secrets ✅');
  console.log('  � Production mode - QuickNode infrastructure fully active');
} else {
  console.log('  � Base ETH: Direct QuickNode endpoint ⚡');
  console.log('  🟣 Solana: Direct QuickNode endpoint ⚡');
  console.log('  🛠️ Development mode - Using direct QuickNode endpoints');
}

console.log('  ⚡ QuickNode infrastructure active for high-performance Web3 operations');
