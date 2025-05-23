/**
 * Global configuration settings for the application
 */

const config = {
  /**
   * API Configuration
   */
  api: {
    // Set to false to use real API endpoints, true to use mockup data
    useMockData: true,
    
    // Base URL for API requests
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-backend.com/api'
      : 'http://localhost:8000/api',
    
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
