// wallet.js
// SIMPLE, CLEAN wallet integration - NO BULLSHIT

class WildWestWallet {
  constructor() {
    this.account = null;
    this.isConnected = false;
    this.currentChain = null;
    this.provider = null;
    this.signer = null;
    this.isConnecting = false; // Add connection state flag
    this.listenersSetup = false; // Prevent duplicate event listeners
    
    this.init();
  }

  async init() {
    // Check if already connected
    await this.checkConnection();
    // Setup UI handlers
    this.setupEventHandlers();
  }

  async checkConnection() {
    try {
      // Check for existing EVM wallet connections
      const availableWallets = this.detectEVMWallets();
      if (availableWallets.length > 0) {
        const primaryWallet = availableWallets[0];
        const accounts = await primaryWallet.provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.account = accounts[0];
          this.isConnected = true;
          this.provider = new ethers.providers.Web3Provider(primaryWallet.provider);
          this.signer = this.provider.getSigner();
          const network = await this.provider.getNetwork();
          this.currentChain = network.chainId;
          this.updateWalletUI();
          console.log(`Wallet already connected via ${primaryWallet.name}:`, this.account);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      this.updateWalletUI();
    }
  }

  // Detect available Solana wallets (including mobile support)
  detectSolanaWallets() {
    const wallets = [];
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Priority 1: Phantom (excellent mobile support)
    if (window.solana?.isPhantom) {
      wallets.push({
        name: 'Phantom',
        provider: window.solana,
        icon: '👻',
        mobile: true,
        deeplink: 'phantom://browse/' + encodeURIComponent(window.location.href)
      });
    }
    
    // Priority 2: Solflare (mobile support)
    else if (window.solflare) {
      wallets.push({
        name: 'Solflare',
        provider: window.solflare,
        icon: '🌟',
        mobile: true,
        deeplink: 'solflare://v1/browse/' + encodeURIComponent(window.location.href)
      });
    }
    
    // Priority 3: Glow (mobile wallet)
    else if (window.glow) {
      wallets.push({
        name: 'Glow',
        provider: window.glow,
        icon: '✨',
        mobile: true
      });
    }
    
    // Priority 4: Slope (mobile support)
    else if (window.solana?.isSlope || window.slope) {
      wallets.push({
        name: 'Slope',
        provider: window.slope || window.solana,
        icon: '📈',
        mobile: true
      });
    }
    
    // Priority 5: Backpack (mobile support)
    else if (window.backpack) {
      wallets.push({
        name: 'Backpack',
        provider: window.backpack,
        icon: '🎒',
        mobile: true
      });
    }
    
    // Priority 6: Generic Solana wallet
    else if (window.solana) {
      wallets.push({
        name: 'Solana Wallet',
        provider: window.solana,
        icon: '🟣',
        mobile: true
      });
    }
    
    // Mobile-specific: If no wallet detected but on mobile, note for mobile guidance
    if (wallets.length === 0 && isMobile) {
      console.log('📱 Mobile device detected with no Solana wallet providers. User may need to open in wallet browser.');
    }
    
    console.log('🟣 Detected Solana wallets:', wallets.map(w => `${w.icon} ${w.name} (Mobile: ${w.mobile})`));
    return wallets;
  }

  async connectSolanaWallet() {
    try {
      // Detect available Solana wallets
      const availableWallets = this.detectSolanaWallets();
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (availableWallets.length === 0) {
        if (isMobile) {
          // Show wallet installation guide
          this.showWalletInstallationGuide('solana');
          return false;
        } else {
          throw new Error('No Solana wallet found. Please install Phantom, Solflare, or another Solana wallet.');
        }
      }
      
      // Use the first available wallet (priority order)
      const selectedWallet = availableWallets[0];
      const wallet = selectedWallet.provider;
      console.log(`Using Solana wallet: ${selectedWallet.name}`);

      // Ensure wallet has connect method
      if (!wallet.connect || typeof wallet.connect !== 'function') {
        throw new Error('Wallet does not support connection');
      }
      
      const response = await wallet.connect();
      console.log('Solana wallet response:', response);
      
      let publicKey = null;
      
      // Handle different response formats
      if (response && typeof response === 'object' && response.publicKey) {
        // Standard format: response contains publicKey
        publicKey = response.publicKey;
      } else if (response === true || response === undefined) {
        // Some wallets return true or undefined on successful connection
        // Public key should be available directly on the wallet
        if (wallet.publicKey) {
          publicKey = wallet.publicKey;
        } else {
          throw new Error('Wallet connected but public key not accessible');
        }
      } else {
        throw new Error('Unexpected wallet response format');
      }
      
      if (!publicKey) {
        throw new Error('No public key found after wallet connection');
      }
      
      // Ensure publicKey has toString method
      if (!publicKey.toString || typeof publicKey.toString !== 'function') {
        throw new Error('Invalid public key format - missing toString method');
      }
      
      this.account = publicKey.toString();
      this.isConnected = true;
      this.currentChain = 'solana';
      this.provider = wallet;
      
      this.updateWalletUI();
      this.showStatus(`Solana wallet connected via ${selectedWallet.name}`, 'success');
      localStorage.setItem('wildwest_wallet_connected', 'solana');
      return true;
    } catch (error) {
      console.error('Solana wallet connection error:', error);
      this.showStatus('Failed to connect Solana wallet: ' + error.message, 'error');
      return false;
    }
  }

  async connectBaseWallet() {
    try {
      // Detect available EVM wallets
      const availableWallets = this.detectEVMWallets();
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (availableWallets.length === 0) {
        if (isMobile) {
          // On mobile, show wallet installation guide
          this.showWalletInstallationGuide('base');
          return false;
        } else {
          throw new Error('No EVM wallet detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet.');
        }
      }
      
      // Use the first available wallet (priority order: MetaMask, Coinbase, others)
      const selectedWallet = availableWallets[0];
      console.log(`Using EVM wallet: ${selectedWallet.name}`);
      
      // Check if already connected first
      const existingAccounts = await selectedWallet.provider.request({ method: 'eth_accounts' });
      if (existingAccounts && existingAccounts.length > 0) {
        this.account = existingAccounts[0];
        this.isConnected = true;
        this.provider = new ethers.providers.Web3Provider(selectedWallet.provider);
        this.signer = this.provider.getSigner();
        
        // Switch to Base network
        await this.switchToBase(selectedWallet.provider);
        
        const network = await this.provider.getNetwork();
        this.currentChain = network.chainId;
        
        this.updateWalletUI();
        this.showStatus(`Base wallet connected via ${selectedWallet.name}`, 'success');
        localStorage.setItem('wildwest_wallet_connected', 'base');
        return true;
      }

      // Request connection
      const accounts = await selectedWallet.provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        this.isConnected = true;
        this.provider = new ethers.providers.Web3Provider(selectedWallet.provider);
        this.signer = this.provider.getSigner();
        
        // Switch to Base network
        await this.switchToBase(selectedWallet.provider);
        
        const network = await this.provider.getNetwork();
        this.currentChain = network.chainId;
        
        this.updateWalletUI();
        this.showStatus(`Base wallet connected via ${selectedWallet.name}`, 'success');
        localStorage.setItem('wildwest_wallet_connected', 'base');
        return true;
      }
    } catch (error) {
      console.error('Base wallet connection error:', error);
      this.showStatus('Failed to connect Base wallet: ' + error.message, 'error');
      return false;
    }
  }

  // Detect available EVM wallets in priority order (including mobile support)
  detectEVMWallets() {
    const wallets = [];
    
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Priority 1: MetaMask (works on mobile via in-app browser)
    if (window.ethereum?.isMetaMask) {
      wallets.push({
        name: 'MetaMask',
        provider: window.ethereum,
        icon: '🦊',
        mobile: true,
        deeplink: 'metamask://dapp/' + window.location.hostname
      });
    }
    
    // Priority 2: Coinbase Wallet (excellent mobile support)
    else if (window.ethereum?.isCoinbaseWallet || window.ethereum?.selectedProvider?.isCoinbaseWallet) {
      wallets.push({
        name: 'Coinbase Wallet',
        provider: window.ethereum,
        icon: '🔵',
        mobile: true,
        deeplink: 'cbwallet://dapp?url=' + encodeURIComponent(window.location.href)
      });
    }
    
    // Priority 3: Rainbow Wallet (mobile support)
    else if (window.ethereum?.isRainbow) {
      wallets.push({
        name: 'Rainbow Wallet',
        provider: window.ethereum,
        icon: '🌈',
        mobile: true,
        deeplink: 'rainbow://dapp/' + window.location.hostname
      });
    }
    
    // Priority 4: Trust Wallet (strong mobile presence)
    else if (window.ethereum?.isTrust) {
      wallets.push({
        name: 'Trust Wallet',
        provider: window.ethereum,
        icon: '🛡️',
        mobile: true,
        deeplink: 'trust://browser_tab_open?url=' + encodeURIComponent(window.location.href)
      });
    }
    
    // Priority 5: Brave Wallet (desktop primarily)
    else if (window.ethereum?.isBraveWallet) {
      wallets.push({
        name: 'Brave Wallet',
        provider: window.ethereum,
        icon: '🦁',
        mobile: false
      });
    }
    
    // Priority 6: Any other EVM wallet
    else if (window.ethereum) {
      wallets.push({
        name: 'Web3 Wallet',
        provider: window.ethereum,
        icon: '🔗',
        mobile: true
      });
    }
    
    // Check for multiple providers (some wallets inject multiple providers)
    if (window.ethereum?.providers) {
      window.ethereum.providers.forEach(provider => {
        if (provider.isMetaMask && !wallets.find(w => w.name === 'MetaMask')) {
          wallets.unshift({
            name: 'MetaMask',
            provider: provider,
            icon: '🦊',
            mobile: true,
            deeplink: 'metamask://dapp/' + window.location.hostname
          });
        } else if (provider.isCoinbaseWallet && !wallets.find(w => w.name === 'Coinbase Wallet')) {
          wallets.unshift({
            name: 'Coinbase Wallet',
            provider: provider,
            icon: '🔵',
            mobile: true,
            deeplink: 'cbwallet://dapp?url=' + encodeURIComponent(window.location.href)
          });
        }
      });
    }
    
    // Mobile-specific: If no wallet detected but on mobile, suggest wallet installation
    if (wallets.length === 0 && isMobile) {
      console.log('📱 Mobile device detected with no wallet providers. User may need to open in wallet browser.');
    }
    
    console.log('🔍 Detected EVM wallets:', wallets.map(w => `${w.icon} ${w.name} (Mobile: ${w.mobile})`));
    return wallets;
  }

  // Show wallet installation guide for mobile users
  showWalletInstallationGuide(network) {
    const modal = document.createElement('div');
    modal.className = 'wallet-modal-overlay';
    
    const isBase = network === 'base';
    const networkName = isBase ? 'Base' : 'Solana';
    const borderColor = isBase ? '#00eaff' : '#9945ff';
    
    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid ${borderColor};
        border-radius: 16px;
        padding: 2rem;
        max-width: 420px;
        width: 90vw;
        text-align: center;
        color: white;
        font-family: 'Orbitron', Arial, sans-serif;
        box-shadow: 0 0 30px rgba(${isBase ? '0, 234, 255' : '153, 69, 255'}, 0.3);
        animation: slideUp 0.3s ease-out;
      ">
        <h2 style="color: ${borderColor}; margin-bottom: 1.5rem; font-size: 1.3rem; font-weight: 600;">
          ${networkName} Wallet Required
        </h2>
        
        <p style="color: #c0c0c0; margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5;">
          To use ${networkName}, open this page in a wallet app:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
          ${isBase ? `
            <a href="https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}" 
               style="
                 display: flex;
                 align-items: center;
                 padding: 1rem;
                 background: rgba(0, 234, 255, 0.05);
                 border: 1px solid rgba(0, 234, 255, 0.2);
                 border-radius: 12px;
                 text-decoration: none;
                 color: white;
                 transition: all 0.2s;
                 font-family: inherit;
               ">
              <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #f6851b, #e2761b);
                border-radius: 10px;
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 1.3rem;
              ">M</div>
              <div style="text-align: left; flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.2rem;">MetaMask</div>
                <div style="font-size: 0.8rem; color: #aaa;">Most popular Web3 wallet</div>
              </div>
            </a>
            
            <a href="https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}" 
               style="
                 display: flex;
                 align-items: center;
                 padding: 1rem;
                 background: rgba(0, 234, 255, 0.05);
                 border: 1px solid rgba(0, 234, 255, 0.2);
                 border-radius: 12px;
                 text-decoration: none;
                 color: white;
                 transition: all 0.2s;
                 font-family: inherit;
               ">
              <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #0052ff, #0041cc);
                border-radius: 10px;
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 1.3rem;
              ">C</div>
              <div style="text-align: left; flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.2rem;">Coinbase Wallet</div>
                <div style="font-size: 0.8rem; color: #aaa;">Easy to use & secure</div>
              </div>
            </a>
            
            <a href="https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}" 
               style="
                 display: flex;
                 align-items: center;
                 padding: 1rem;
                 background: rgba(0, 234, 255, 0.05);
                 border: 1px solid rgba(0, 234, 255, 0.2);
                 border-radius: 12px;
                 text-decoration: none;
                 color: white;
                 transition: all 0.2s;
                 font-family: inherit;
               ">
              <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #3375bb, #2e68a8);
                border-radius: 10px;
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 1.3rem;
              ">T</div>
              <div style="text-align: left; flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.2rem;">Trust Wallet</div>
                <div style="font-size: 0.8rem; color: #aaa;">Multi-chain support</div>
              </div>
            </a>
          ` : `
            <a href="phantom://browse/${encodeURIComponent(window.location.href)}" 
               style="
                 display: flex;
                 align-items: center;
                 padding: 1rem;
                 background: rgba(153, 69, 255, 0.05);
                 border: 1px solid rgba(153, 69, 255, 0.2);
                 border-radius: 12px;
                 text-decoration: none;
                 color: white;
                 transition: all 0.2s;
                 font-family: inherit;
               ">
              <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #ab9ff2, #9945ff);
                border-radius: 10px;
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 1.3rem;
              ">P</div>
              <div style="text-align: left; flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.2rem;">Phantom</div>
                <div style="font-size: 0.8rem; color: #aaa;">Leading Solana wallet</div>
              </div>
            </a>
            
            <a href="solflare://v1/browse/${encodeURIComponent(window.location.href)}" 
               style="
                 display: flex;
                 align-items: center;
                 padding: 1rem;
                 background: rgba(153, 69, 255, 0.05);
                 border: 1px solid rgba(153, 69, 255, 0.2);
                 border-radius: 12px;
                 text-decoration: none;
                 color: white;
                 transition: all 0.2s;
                 font-family: inherit;
               ">
              <div style="
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #fc8c03, #f57c00);
                border-radius: 10px;
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 1.3rem;
              ">S</div>
              <div style="text-align: left; flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.2rem;">Solflare</div>
                <div style="font-size: 0.8rem; color: #aaa;">Feature-rich & secure</div>
              </div>
            </a>
          `}
        </div>
        
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid #666;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          font-size: 0.9rem;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  async switchToBase(provider = window.ethereum) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Add Base network
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x2105',
            chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: [window.RPC_CONFIG ? window.RPC_CONFIG.getBaseEndpoint() : 'https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]
        });
      } else {
        throw switchError;
      }
    }
  }

  async connectWithChainSelection() {
    console.log('🔍 connectWithChainSelection called - showing chain selection modal');
    // For index page - show chain selection modal
    return new Promise((resolve) => {
      this.showChainSelectionModal(resolve);
    });
  }

  showChainSelectionModal(callback) {
    // Add CSS animations if not already added
    if (!document.getElementById('wallet-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'wallet-modal-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .wallet-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }
        .chain-selection-modal {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 2px solid #00eaff;
          border-radius: 16px;
          box-shadow: 0 0 30px rgba(0, 234, 255, 0.3);
          max-width: 450px;
          width: 90vw;
          max-height: 80vh;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
          margin: 1rem;
          font-family: 'Orbitron', Arial, sans-serif;
        }
        .chain-option {
          display: flex;
          align-items: center;
          padding: 1.2rem;
          background: rgba(0, 234, 255, 0.03);
          border: 1px solid rgba(0, 234, 255, 0.15);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
          text-decoration: none;
          font-size: 1rem;
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 0.8rem;
        }
        .chain-option:hover {
          background: rgba(0, 234, 255, 0.08);
          border-color: rgba(0, 234, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 234, 255, 0.2);
        }
        .chain-option:active {
          transform: translateY(0);
        }
        .chain-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          margin-right: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 1.4rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .base-icon {
          background: linear-gradient(135deg, #0052ff, #0041cc);
          border: 1px solid rgba(0, 82, 255, 0.3);
        }
        .solana-icon {
          background: linear-gradient(135deg, #9945ff, #7c3aed);
          border: 1px solid rgba(153, 69, 255, 0.3);
        }
        .chain-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .chain-name {
          font-weight: 600;
          margin-bottom: 0.3rem;
          font-size: 1.1rem;
        }
        .chain-desc {
          font-size: 0.85rem;
          color: #aaa;
          line-height: 1.3;
        }
        .chain-arrow {
          color: #00eaff;
          font-weight: bold;
          margin-left: 1rem;
          font-size: 1.2rem;
        }
        @media (max-width: 480px) {
          .chain-selection-modal {
            width: 95vw;
            margin: 0.5rem;
          }
          .chain-option {
            padding: 1rem;
          }
          .chain-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
          .chain-name {
            font-size: 1rem;
          }
          .chain-desc {
            font-size: 0.8rem;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const modal = document.createElement('div');
    modal.className = 'wallet-modal-overlay';
    
    modal.innerHTML = `
      <div class="chain-selection-modal">
        <div style="
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 234, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h3 style="margin: 0; color: #00eaff; font-size: 1.3rem; font-weight: 600;">Select Network</h3>
          <button class="close-modal" style="
            background: none;
            border: none;
            color: #00eaff;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
          ">×</button>
        </div>
        <div style="padding: 1.5rem;">
          <button class="chain-option" data-chain="base">
            <div class="chain-icon base-icon">B</div>
            <div class="chain-info">
              <span class="chain-name">Base Network</span>
              <span class="chain-desc">EVM Compatible • Low fees • MetaMask, Coinbase, Trust Wallet</span>
            </div>
            <div class="chain-arrow">→</div>
          </button>
          <button class="chain-option" data-chain="solana">
            <div class="chain-icon solana-icon">S</div>
            <div class="chain-info">
              <span class="chain-name">Solana Network</span>
              <span class="chain-desc">Fast & Ultra-low fees • Phantom, Solflare, Backpack</span>
            </div>
            <div class="chain-arrow">→</div>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle chain selection
    modal.querySelectorAll('.chain-option').forEach(btn => {
      btn.addEventListener('click', async () => {
        const chain = btn.dataset.chain;
        document.body.removeChild(modal);
        
        if (chain === 'base') {
          const connected = await this.connectBaseWallet();
          callback(connected);
        } else if (chain === 'solana') {
          const connected = await this.connectSolanaWallet();
          callback(connected);
        }
      });
    });
    
    // Handle close
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
      callback(false);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        callback(false);
      }
    });
  }

  async connectWallet(chain = null) {
    console.log('🔍 connectWallet called with chain:', chain);
    
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('Connection already in progress, please wait...');
      return false;
    }

    try {
      this.isConnecting = true;
      
      // If no chain specified, ALWAYS show chain selection first
      if (!chain) {
        console.log('✅ No chain specified, showing chain selection modal');
        return await this.connectWithChainSelection();
      }
      
      console.log('🔍 Chain specified:', chain);
      
      // Handle chain-specific connections
      if (chain === 'solana') {
        console.log('🟣 Connecting to Solana...');
        return await this.connectSolanaWallet();
      }
      
      // For Base/EVM chains
      if (chain === 'base') {
        console.log('🔵 Connecting to Base...');
        return await this.connectBaseWallet();
      }

      // If we get here, something went wrong
      console.log('❌ Unknown chain specified:', chain);
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      this.showStatus('Failed to connect wallet: ' + error.message, 'error');
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnectWallet() {
    try {
      // Properly disconnect from Solana wallets
      if (this.currentChain === 'solana' && this.provider) {
        try {
          if (this.provider.disconnect && typeof this.provider.disconnect === 'function') {
            await this.provider.disconnect();
          }
        } catch (solanaError) {
          console.log('Solana wallet disconnect method not available or failed:', solanaError);
        }
      }
      
      // Clear wallet state
      this.account = null;
      this.isConnected = false;
      this.signer = null;
      this.provider = null;
      this.currentChain = null;
      
      // Clear localStorage
      localStorage.removeItem('wildwest_wallet_connected');
      
      // Update UI
      this.updateWalletUI();
      this.hideWalletDropdown();
      this.showStatus('Wallet disconnected', 'info');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  hideWalletDropdown() {
    const walletDropdownMenu = document.getElementById('walletDropdownMenu');
    if (walletDropdownMenu) {
      walletDropdownMenu.style.display = 'none';
    }
  }

  updateWalletUI() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletBtnText = document.getElementById('walletBtnText');
    const chainIndicator = document.getElementById('chainIndicator');
    const chainName = document.getElementById('chainName');
    
    if (!connectBtn) return;

    if (this.isConnected && this.account) {
      const shortAddress = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
      
      if (walletBtnText) {
        walletBtnText.textContent = shortAddress;
      } else {
        connectBtn.textContent = shortAddress;
      }
      
      // Remove all state classes first
      connectBtn.classList.remove('disconnected', 'evm', 'solana');
      connectBtn.classList.add('connected');
      
      // Add appropriate chain class for the indicator color and show chain name
      if (this.currentChain === 'solana') {
        connectBtn.classList.add('solana');
        if (chainIndicator) {
          chainIndicator.style.display = 'inline-block';
        }
        if (chainName) {
          chainName.textContent = 'SOLANA';
          chainName.style.display = 'block';
        }
      } else if (this.currentChain === 8453 || this.currentChain === 84532) {
        connectBtn.classList.add('evm');
        if (chainIndicator) {
          chainIndicator.style.display = 'inline-block';
        }
        if (chainName) {
          chainName.textContent = 'BASE';
          chainName.style.display = 'block';
        }
      } else {
        connectBtn.classList.add('evm');
        if (chainIndicator) {
          chainIndicator.style.display = 'inline-block';
        }
        if (chainName) {
          const chainNameText = this.getChainName(this.currentChain);
          chainName.textContent = chainNameText.toUpperCase();
          chainName.style.display = 'block';
        }
      }
    } else {
      if (walletBtnText) {
        walletBtnText.textContent = 'Connect Wallet';
      } else {
        connectBtn.textContent = 'CONNECT WALLET';
      }
      
      // Remove all state classes and add disconnected
      connectBtn.classList.remove('connected', 'evm', 'solana');
      connectBtn.classList.add('disconnected');
      
      if (chainIndicator) {
        chainIndicator.style.display = 'none';
      }
      if (chainName) {
        chainName.style.display = 'none';
      }
    }
  }

  getChainName(chainId) {
    const chains = {
      1: 'Ethereum',
      8453: 'Base',
      84532: 'Base Sepolia',
      137: 'Polygon'
    };
    return chains[chainId] || chainId === 'solana' ? 'Solana' : `Chain ${chainId}`;
  }

  setupEventHandlers() {
    // Check if another script is handling the wallet button
    if (window.TOKEN_FURNACE_HANDLES_WALLET_BUTTON) {
      console.log('Token furnace is handling wallet button, skipping wallet.js button setup');
      return;
    }
    if (window.BASE_LOCKING_HANDLES_WALLET_BUTTON) {
      console.log('Base locking page is handling wallet button, skipping wallet.js button setup');
      return;
    }
    if (window.SOLANA_LOCKING_HANDLES_WALLET_BUTTON) {
      console.log('Solana locking page is handling wallet button, skipping wallet.js button setup');
      return;
    }
    
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (connectBtn) {
      // Remove any existing listeners to prevent duplicates
      connectBtn.replaceWith(connectBtn.cloneNode(true));
      const newConnectBtn = document.getElementById('connectWalletBtn');
      
      newConnectBtn.addEventListener('click', async () => {
        if (this.isConnected) {
          // Show dropdown menu instead of immediately disconnecting
          const walletDropdownMenu = document.getElementById('walletDropdownMenu');
          if (walletDropdownMenu) {
            const isVisible = walletDropdownMenu.style.display === 'block';
            walletDropdownMenu.style.display = isVisible ? 'none' : 'block';
          } else {
            // Fallback: disconnect if no dropdown available
            await this.disconnectWallet();
          }
        } else {
          if (!this.isConnecting) {
            await this.connectWallet();
          }
        }
      });
      
      // Setup disconnect button in dropdown
      const disconnectBtn = document.getElementById('disconnectBtn');
      if (disconnectBtn) {
        disconnectBtn.addEventListener('click', async () => {
          await this.disconnectWallet();
        });
      }
      
      // Hide dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const walletDropdownMenu = document.getElementById('walletDropdownMenu');
        const connectBtn = document.getElementById('connectWalletBtn');
        
        if (walletDropdownMenu && connectBtn && 
            !connectBtn.contains(e.target) && 
            !walletDropdownMenu.contains(e.target)) {
          walletDropdownMenu.style.display = 'none';
        }
      });
    }

    // Listen for account changes (only set up once)
    if (typeof window.ethereum !== 'undefined' && !this.listenersSetup) {
      this.listenersSetup = true;
      
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else if (accounts[0] !== this.account) {
          this.account = accounts[0];
          this.updateWalletUI();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.currentChain = parseInt(chainId, 16);
        this.updateWalletUI();
        window.location.reload();
      });
    }
  }

  showStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Simple status display
    const statusDiv = document.createElement('div');
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      border-radius: 8px;
      z-index: 9999;
      font-weight: bold;
      max-width: 300px;
      ${type === 'success' ? 'background: #0f5132; color: #d1e7dd;' : ''}
      ${type === 'error' ? 'background: #842029; color: #f8d7da;' : ''}
      ${type === 'info' ? 'background: #055160; color: #cff4fc;' : ''}
    `;
    
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
      if (statusDiv.parentNode) {
        document.body.removeChild(statusDiv);
      }
    }, 3000);
  }

  // Utility methods for dApp integration
  async getBalance() {
    if (!this.isConnected || !this.account || !this.provider) return '0';
    
    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async sendTransaction(to, value, data = '0x') {
    if (!this.isConnected || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value.toString()),
        data
      });
      
      return tx;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}

// Initialize wallet when DOM is loaded
let wildWestWallet;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - initializing wallet system');
  wildWestWallet = new WildWestWallet();
  // Make it globally available
  window.wildWestWallet = wildWestWallet;
  console.log('wildWestWallet initialized and made globally available');
});

// Also make it available immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
} else {
  // DOM is already loaded
  console.log('DOM already loaded - initializing wallet system immediately');
  wildWestWallet = new WildWestWallet();
  window.wildWestWallet = wildWestWallet;
  console.log('wildWestWallet initialized and made globally available');
}

// Export for use in other files
window.WildWestWallet = WildWestWallet;
