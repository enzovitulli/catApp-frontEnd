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
      // Base URL for API requests - using the fast-turkey-noted ngrok URL
    baseUrl: 'https://fast-turkey-noted.ngrok-free.app/api',
    
    // API request timeout in milliseconds
    timeout: 10000,
  },
  
};

export default config;
