// Script to delete all bottom banners from GitHub repository
// This will clear out all banners from the banners/bottom folder

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
    
    // Fetch current bottom banners
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

// Make function globally available
window.deleteBottomBanners = deleteBottomBanners;

console.log('🗑️ Bottom banner deletion script loaded');
console.log('📝 Usage: deleteBottomBanners()');
