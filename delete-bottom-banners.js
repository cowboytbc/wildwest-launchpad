// Script to delete all bottom banners from GitHub repository
// This will clear out all banners from the banners/bottom folder

// Debug function to check token availability
function debugTokenStatus() {
  console.log('🔍 Token Debug Information:');
  console.log('  - window.PRODUCTION_CONFIG exists:', !!window.PRODUCTION_CONFIG);
  console.log('  - window.PRODUCTION_CONFIG.token exists:', !!(window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.token));
  console.log('  - window.PRODUCTION_CONFIG.environment:', window.PRODUCTION_CONFIG ? window.PRODUCTION_CONFIG.environment : 'N/A');
  console.log('  - window.SECURE_CONFIG exists:', !!window.SECURE_CONFIG);
  
  if (window.SECURE_CONFIG) {
    const githubConfig = window.SECURE_CONFIG.getGitHubConfig();
    console.log('  - GitHub config:', githubConfig);
    console.log('  - Token available in config:', !!githubConfig.token);
    console.log('  - Token length:', githubConfig.token ? githubConfig.token.length : 0);
    console.log('  - Repository:', `${githubConfig.owner}/${githubConfig.repo}`);
  }
  
  return {
    productionConfig: window.PRODUCTION_CONFIG,
    secureConfig: window.SECURE_CONFIG ? window.SECURE_CONFIG.getGitHubConfig() : null
  };
}

async function deleteBottomBanners() {
  console.log('🗑️ Starting deletion of all bottom banners...');
  
  try {
    // Get GitHub configuration
    if (!window.SECURE_CONFIG) {
      console.error('❌ SECURE_CONFIG not available - cannot delete banners');
      return false;
    }
    
    const githubConfig = window.SECURE_CONFIG.getGitHubConfig();
    if (!githubConfig || !githubConfig.token) {
      console.error('❌ GitHub token not available - cannot delete banners');
      return false;
    }
    
    console.log('🔍 Fetching bottom banners to delete...');
    console.log('📍 Repository:', `${githubConfig.owner}/${githubConfig.repo}`);
    console.log('📍 Folder:', 'banners/bottom');
    
    // Fetch current bottom banners from the banner storage repository
    const bottomBannersUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/banners/bottom`;
    
    const response = await fetch(bottomBannersUrl, {
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch bottom banners:', response.status, response.statusText);
      return false;
    }
    
    const files = await response.json();
    console.log(`📁 Found ${files.length} files in bottom banners folder`);
    
    // Filter out .gitkeep and only delete image files
    const bannersToDelete = files.filter(file => 
      file.type === 'file' && 
      !file.name.includes('.gitkeep') &&
      (file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.gif') || file.name.endsWith('.jpeg'))
    );
    
    console.log(`🎯 Found ${bannersToDelete.length} banner images to delete`);
    
    if (bannersToDelete.length === 0) {
      console.log('✅ No banner images found to delete');
      return true;
    }
    
    // Delete each banner
    let deletedCount = 0;
    for (const banner of bannersToDelete) {
      try {
        console.log(`🗑️ Deleting: ${banner.name}`);
        
        const deleteResponse = await fetch(banner.url, {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${githubConfig.token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Delete bottom banner: ${banner.name}`,
            sha: banner.sha
          })
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Deleted: ${banner.name}`);
          deletedCount++;
        } else {
          console.error(`❌ Failed to delete ${banner.name}:`, deleteResponse.status, deleteResponse.statusText);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error deleting ${banner.name}:`, error);
      }
    }
    
    console.log(`🎯 Deletion complete: ${deletedCount}/${bannersToDelete.length} banners deleted`);
    
    // Clear banner cache and refresh
    if (window.BANNER_CONFIG) {
      console.log('🔄 Clearing banner cache...');
      window.BANNER_CONFIG.clearCache();
      
      // Refresh banners
      await window.BANNER_CONFIG.fetchBannersFromGitHub();
      
      // Update rotation system
      if (window.bannerRotationManager) {
        window.bannerRotationManager.updateBanners();
      }
    }
    
    console.log('✅ Bottom banner deletion completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error during banner deletion:', error);
    return false;
  }
}

// Debug function to inspect actual banner data
function inspectBottomBanner() {
  console.log('🔍 Inspecting current bottom banner data...');
  
  if (!window.BANNER_CONFIG) {
    console.error('❌ BANNER_CONFIG not available');
    return;
  }
  
  const bottomBanners = window.BANNER_CONFIG.BOTTOM_BANNERS;
  const currentBottom = window.BANNER_CONFIG.getCurrentBanner('bottom');
  
  console.log('📊 Bottom Banners Cache:', bottomBanners);
  console.log('📊 Current Bottom Banner:', currentBottom);
  
  if (bottomBanners && bottomBanners.length > 0) {
    console.log('🔍 First bottom banner details:');
    const firstBanner = bottomBanners[0];
    console.log('  - filename:', firstBanner.filename);
    console.log('  - projectName:', firstBanner.projectName);
    console.log('  - link:', firstBanner.link);
    console.log('  - linkUrl:', firstBanner.linkUrl);
    console.log('  - position:', firstBanner.position);
    console.log('  - isDefault:', firstBanner.isDefault);
    console.log('  - imageUrl:', firstBanner.imageUrl?.substring(0, 50) + '...');
  }
  
  return {
    bottomBanners,
    currentBottom,
    bannerCount: bottomBanners?.length || 0
  };
}

// Make functions globally available
window.deleteBottomBanners = deleteBottomBanners;
window.debugTokenStatus = debugTokenStatus;
window.inspectBottomBanner = inspectBottomBanner;

console.log('🗑️ Bottom banner deletion script loaded');
console.log('📝 Usage: deleteBottomBanners()');
console.log('🔍 Debug: debugTokenStatus()');
