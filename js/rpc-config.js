// RPC endpoint configuration for all networks
// Update these with your preferred RPC endpoints

const RPC_CONFIG = {
  // Solana RPC endpoints - QuickNode only from GitHub Secrets
  SOLANA: {
    PRIMARY: window.PRODUCTION_CONFIG?.rpc?.solana || window.ENV_CONFIG?.rpc?.solana,
    QUICKNODE: window.PRODUCTION_CONFIG?.rpc?.solana || window.ENV_CONFIG?.rpc?.solana
  },
  
  // Base/Ethereum RPC endpoints - QuickNode only from GitHub Secrets  
  BASE: {
    PRIMARY: window.PRODUCTION_CONFIG?.rpc?.base || window.ENV_CONFIG?.rpc?.base,
    QUICKNODE: window.PRODUCTION_CONFIG?.rpc?.base || window.ENV_CONFIG?.rpc?.base
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
  getSolanaEndpoint: function() {
    const endpoint = this.SOLANA.PRIMARY;
    console.log('🔍 Debug: getSolanaEndpoint() returning:', endpoint);
    console.log('🔍 Debug: PRODUCTION_CONFIG.rpc.solana:', window.PRODUCTION_CONFIG?.rpc?.solana);
    console.log('🔍 Debug: ENV_CONFIG.rpc.solana:', window.ENV_CONFIG?.rpc?.solana);
    return endpoint;
  },
  
  getBaseEndpoint: function() {
    return this.BASE.PRIMARY;
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

console.log('🌐 RPC Configuration loaded with QuickNode endpoints:');
console.log('  🔵 Base ETH:', RPC_CONFIG.BASE.PRIMARY);
console.log('  🟣 Solana:', RPC_CONFIG.SOLANA.PRIMARY);
console.log('  ⚡ QuickNode infrastructure ready for high-performance Web3 operations');
