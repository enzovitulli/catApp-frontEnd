import axios from 'axios';
import config from './config';

// Mock data
import { mockupPets } from './mockData';

// Base API configuration - simplified without CORS headers
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    "ngrok-skip-browser-warning": "true",
  }
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// API service for pets
export const cardsApi = {
  /**
   * Get all available pets
   * @returns {Promise<Array>} - Promise resolving to array of pet objects
   */
  getAllCards: () => {
    if (config.api.useMockData) {
      console.log('Using mock data for pets');
      // Return mock data with artificial delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockupPets });
        }, 500);
      });
    }
    
    console.log('Fetching animals from API:', `${config.api.baseUrl}/animales/`);
    
    // Simple GET request to the API endpoint
    return apiClient.get('/animales/')
      .catch(error => {
        console.error('API Error:', error);
        // In case of error, we still return mock data as fallback
        return { data: mockupPets };
      });
  },
  
  /**
   * Get a specific pet by ID
   * @param {string|number} id - The pet ID
   * @returns {Promise<Object>} - Promise resolving to pet object
   */
  getCardById: (id) => {
    if (config.api.useMockData) {
      console.log(`Using mock data for pet with ID: ${id}`);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const pet = mockupPets.find(p => p.id == id); // Loose equality for numeric/string IDs
          if (pet) {
            resolve({ data: pet });
          } else {
            reject(new Error('Pet not found'));
          }
        }, 300);
      });
    }
    
    console.log('Fetching pet details from API:', `${config.api.baseUrl}/animales/${id}/`);
    
    // Simple GET request to the API endpoint
    return apiClient.get(`/animales/${id}/`)
      .catch(error => {
        console.error('API Error:', error);
        // In case of error, we still return mock data as fallback
        const pet = mockupPets.find(p => p.id == id);
        if (pet) {
          return { data: pet };
        } else {
          throw new Error('Pet not found');
        }
      });
  },
  
  /**
   * Like a pet (save to favorites)
   * @param {string|number} id - The pet ID
   * @returns {Promise<Object>} - Promise with updated favorite status
   */
  likePet: (id) => {
    if (config.api.useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Mock favoriting pet with ID: ${id}`);
          resolve({ data: { success: true, favorited: true } });
        }, 300);
      });
    }
    // This endpoint will need to be implemented in the backend
    return apiClient.post(`/animales/${id}/favorito/`);
  },
};

export default apiClient;
