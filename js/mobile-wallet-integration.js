// mobile-wallet-integration.js
// 🔗 INTEGRATION BETWEEN MOBILE WALLET DETECTOR AND EXISTING WALLET SYSTEM

class MobileWalletIntegration {
  constructor() {
    this.initialized = false;
    this.isMobile = this.detectMobile();
    
    // Wait for dependencies to load
    this.waitForDependencies();
  }

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
  }

  async waitForDependencies() {
    console.log('🔗 Waiting for wallet dependencies...');
    
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    const checkDependencies = () => {
      attempts++;
      
      if (window.wildWestWallet && window.mobileWalletDetector) {
        console.log('✅ Wallet dependencies loaded, initializing mobile integration...');
        this.init();
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkDependencies, 100);
      } else {
        console.log('⚠️ Wallet dependencies not found after 5 seconds');
      }
    };
    
    checkDependencies();
  }

  async init() {
    if (this.initialized) return;
    
    console.log('🔗 Initializing mobile wallet integration...');
    
    // Override existing wallet connection to use mobile detection
    this.enhanceWalletConnection();
    
    // Add mobile-specific wallet guidance
    this.addMobileWalletGuidance();
    
    // Integrate with existing connect wallet button
    this.enhanceConnectButton();
    
    this.initialized = true;
    console.log('✅ Mobile wallet integration complete');
  }

  enhanceWalletConnection() {
    if (!window.wildWestWallet) return;
    
    // Store original connect method
    const originalConnect = window.wildWestWallet.connectWallet.bind(window.wildWestWallet);
    
    // Override with mobile-aware version
    window.wildWestWallet.connectWallet = async (walletType = null) => {
      console.log('🔗 Enhanced mobile wallet connection triggered');
      
      if (this.isMobile) {
        return this.handleMobileWalletConnection(walletType, originalConnect);
      } else {
        return originalConnect(walletType);
      }
    };
    
    console.log('🔗 Enhanced wallet connection method');
  }

  async handleMobileWalletConnection(walletType, originalConnect) {
    console.log('📱 Handling mobile wallet connection...');
    
    // Check if any mobile wallets are detected
    const detectedWallets = window.mobileWalletDetector.getDetectedWallets();
    const availableWallets = detectedWallets.filter(w => w.status === 'available');
    
    if (availableWallets.length > 0) {
      console.log('✅ Mobile wallets available, proceeding with connection...');
      
      // If specific wallet type requested, try to connect to it
      if (walletType) {
        const targetWallet = availableWallets.find(w => 
          w.id.includes(walletType.toLowerCase()) || 
          w.name.toLowerCase().includes(walletType.toLowerCase())
        );
        
        if (targetWallet) {
          console.log(`🎯 Connecting to specific mobile wallet: ${targetWallet.name}`);
          return originalConnect(walletType);
        }
      }
      
      // Show mobile wallet selection if multiple available
      if (availableWallets.length > 1) {
        return this.showMobileWalletSelection(availableWallets, originalConnect);
      } else {
        // Single wallet available, connect directly
        console.log(`🔗 Connecting to ${availableWallets[0].name}...`);
        return originalConnect();
      }
    } else {
      // No wallets detected, show mobile guidance
      return this.showMobileWalletGuidance(detectedWallets);
    }
  }

  async showMobileWalletSelection(availableWallets, originalConnect) {
    return new Promise((resolve) => {
      console.log('📱 Showing mobile wallet selection...');
      
      // Create mobile wallet selection modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        z-index: 999999999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 3px solid #00eaff;
        border-radius: 20px;
        padding: 30px;
        max-width: 350px;
        width: 85%;
        text-align: center;
        font-family: 'Orbitron', Arial, sans-serif;
        box-shadow: 0 0 50px rgba(0, 234, 255, 0.5);
      `;
      
      let html = `
        <h3 style="color: #00eaff; margin: 0 0 20px 0; font-size: 20px;">
          🔗 Select Wallet to Connect
        </h3>
      `;
      
      availableWallets.forEach((wallet, index) => {
        html += `
          <button onclick="window.mobileWalletIntegration.selectWallet(${index})" style="
            display: block;
            width: 100%;
            margin: 0 0 15px 0;
            padding: 15px;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          ">
            <span style="font-size: 18px; margin-right: 10px;">${wallet.icon}</span>
            ${wallet.name}
          </button>
        `;
      });
      
      html += `
        <button onclick="window.mobileWalletIntegration.cancelSelection()" style="
          display: block;
          width: 100%;
          padding: 12px;
          background: transparent;
          color: #00eaff;
          border: 2px solid #00eaff;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        ">Cancel</button>
      `;
      
      content.innerHTML = html;
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      // Store resolve function and wallets for selection
      this._selectionResolve = resolve;
      this._selectionWallets = availableWallets;
      this._selectionModal = modal;
      this._originalConnect = originalConnect;
    });
  }

  selectWallet(index) {
    const wallet = this._selectionWallets[index];
    console.log(`🔗 User selected: ${wallet.name}`);
    
    // Close modal
    this._selectionModal.remove();
    
    // Connect to selected wallet
    this._originalConnect().then(result => {
      this._selectionResolve(result);
    }).catch(error => {
      this._selectionResolve(false);
    });
  }

  cancelSelection() {
    console.log('❌ User cancelled wallet selection');
    this._selectionModal.remove();
    this._selectionResolve(false);
  }

  async showMobileWalletGuidance(detectedWallets) {
    console.log('📱 Showing mobile wallet guidance...');
    
    const installableWallets = detectedWallets.filter(w => w.status === 'installable');
    const detectedButNotAvailable = detectedWallets.filter(w => w.status === 'detected');
    
    let message = '📱 No wallet connected!\n\n';
    
    if (detectedButNotAvailable.length > 0) {
      message += '🔍 We detected these wallets on your device:\n';
      detectedButNotAvailable.forEach(w => {
        message += `• ${w.name}\n`;
      });
      message += '\nPlease open this page in your wallet app\'s browser, or refresh the page after ensuring your wallet is properly installed.\n\n';
    }
    
    if (installableWallets.length > 0) {
      message += '💡 Recommended mobile wallets to install:\n';
      installableWallets.slice(0, 3).forEach(w => {
        message += `• ${w.name}\n`;
      });
      message += '\nWould you like to see wallet installation options?';
      
      const showOptions = confirm(message);
      if (showOptions) {
        window.mobileWalletDetector.showMobileWalletModal();
      }
    } else {
      message += 'Please install a mobile wallet app like MetaMask, Trust Wallet, or Coinbase Wallet to connect.';
      alert(message);
    }
    
    return false;
  }

  enhanceConnectButton() {
    // Find existing connect wallet button
    const connectBtn = document.getElementById('connectWalletBtn');
    if (!connectBtn || !this.isMobile) return;
    
    console.log('🔗 Enhancing connect wallet button for mobile...');
    
    // Store original click handler
    const originalHandler = connectBtn.onclick;
    
    // Add mobile-specific styling
    connectBtn.style.cssText += `
      padding: 12px 20px !important;
      font-size: 16px !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    `;
    
    // Update button text for mobile
    if (connectBtn.textContent.includes('Connect')) {
      connectBtn.innerHTML = '📱 Connect Mobile Wallet';
    }
    
    console.log('✅ Connect button enhanced for mobile');
  }

  addMobileWalletGuidance() {
    if (!this.isMobile) return;
    
    console.log('📱 Adding mobile wallet guidance...');
    
    // Add mobile wallet info to the page
    const walletSection = document.querySelector('.wallet-section') || document.querySelector('nav');
    if (!walletSection) return;
    
    // Check if guidance already exists
    if (document.getElementById('mobile-wallet-info')) return;
    
    const infoDiv = document.createElement('div');
    infoDiv.id = 'mobile-wallet-info';
    infoDiv.style.cssText = `
      background: rgba(0, 234, 255, 0.1);
      border: 1px solid rgba(0, 234, 255, 0.3);
      border-radius: 8px;
      padding: 10px;
      margin: 10px 0;
      font-size: 12px;
      color: #00eaff;
      display: none;
    `;
    
    const detectedWallets = window.mobileWalletDetector.getDetectedWallets();
    const availableCount = detectedWallets.filter(w => w.status === 'available').length;
    
    if (availableCount > 0) {
      infoDiv.innerHTML = `
        <span style="font-size: 16px;">📱</span>
        <strong>${availableCount} mobile wallet${availableCount > 1 ? 's' : ''} detected!</strong>
        Ready to connect.
      `;
      infoDiv.style.display = 'block';
    } else {
      infoDiv.innerHTML = `
        <span style="font-size: 16px;">💡</span>
        <strong>Mobile Tip:</strong> Install a wallet app for the best experience.
        <button onclick="window.mobileWalletDetector.showMobileWalletModal()" style="
          background: none;
          border: 1px solid #00eaff;
          color: #00eaff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          margin-left: 5px;
          cursor: pointer;
        ">View Options</button>
      `;
      infoDiv.style.display = 'block';
    }
    
    walletSection.appendChild(infoDiv);
    console.log('✅ Mobile wallet guidance added');
  }

  // Utility function to refresh mobile wallet status
  async refreshMobileWalletStatus() {
    if (!this.isMobile || !window.mobileWalletDetector) return;
    
    console.log('🔄 Refreshing mobile wallet status...');
    
    // Re-detect wallets
    await window.mobileWalletDetector.detectAvailableWallets();
    
    // Update guidance
    const infoDiv = document.getElementById('mobile-wallet-info');
    if (infoDiv) {
      infoDiv.remove();
      this.addMobileWalletGuidance();
    }
    
    console.log('✅ Mobile wallet status refreshed');
  }
}

// Initialize mobile wallet integration
document.addEventListener('DOMContentLoaded', function() {
  window.mobileWalletIntegration = new MobileWalletIntegration();
});

// Auto-refresh wallet status when page becomes visible (user switching apps)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && window.mobileWalletIntegration) {
    setTimeout(() => {
      window.mobileWalletIntegration.refreshMobileWalletStatus();
    }, 1000);
  }
});

console.log('🔗 Mobile Wallet Integration loaded');
