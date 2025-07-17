// Quick Banner Refresh for Development
// Add this to the browser console on the main page to force refresh banners

function forceRefreshBanners() {
    console.log('🔄 Forcing banner refresh...');
    
    if (window.BANNER_CONFIG) {
        // Clear cache
        window.BANNER_CONFIG.clearCache();
        
        // Fetch fresh banners
        window.BANNER_CONFIG.fetchBannersFromGitHub().then(() => {
            console.log('✅ Banners fetched, updating display...');
            
            // Force banner rotation update
            if (window.bannerRotationManager) {
                window.bannerRotationManager.updateBanners();
                console.log('✅ Banner rotation updated');
            }
            
            // Log current banners
            const topBanners = window.BANNER_CONFIG.TOP_BANNERS;
            const bottomBanners = window.BANNER_CONFIG.BOTTOM_BANNERS;
            
            console.log('📊 Current banners:', {
                top: topBanners.length,
                bottom: bottomBanners.length,
                topBanners: topBanners,
                bottomBanners: bottomBanners
            });
            
        }).catch(error => {
            console.error('❌ Banner refresh failed:', error);
        });
    } else {
        console.error('❌ BANNER_CONFIG not available');
    }
}

// Auto-run the refresh
console.log('🚀 Running automatic banner refresh...');
forceRefreshBanners();
