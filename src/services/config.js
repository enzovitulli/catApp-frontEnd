/**
 * Global configuration settings for the application
 */

const config = {
  /**
   * API Configuration
   */
  api: {
    // Set to false to use real API endpoints, true to use mockup data
    useMockData: false, // Using real API data
    
    // Base URL for API requests - simplified to just use the ngrok URL
    baseUrl: 'https://dcd4-83-231-114-94.ngrok-free.app/api',
    
    // API request timeout in milliseconds
    timeout: 10000,
  },
  
  /**
   * Feature flags
   */
  features: {
    enableComments: true,
    enableLikes: true,
    enableUserProfiles: false, // Not implemented yet
  }
};

export default config;
