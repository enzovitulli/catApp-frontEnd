import axios from 'axios';
import config from './config';

// Mock data
import { mockupPets } from './mockData';

// Base API configuration
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
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

// Card-related API calls (rename to petApi later)
export const cardsApi = {
  /**
   * Get all available pets
   * @returns {Promise<Array>} - Promise resolving to array of pet objects
   */
  getAllCards: () => {
    if (config.api.useMockData) {
      // Return mock data with artificial delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockupPets });
        }, 500);
      });
    }
    // TODO: Update endpoint when API is ready
    return apiClient.get('/pets/');
  },
  
  /**
   * Get a specific pet by ID
   * @param {string|number} id - The pet ID
   * @returns {Promise<Object>} - Promise resolving to pet object
   */
  getCardById: (id) => {
    if (config.api.useMockData) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const pet = mockupPets.find(p => p.id === id);
          if (pet) {
            resolve({ data: pet });
          } else {
            reject(new Error('Pet not found'));
          }
        }, 300);
      });
    }
    // TODO: Update endpoint when API is ready
    return apiClient.get(`/pets/${id}/`);
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
    // TODO: Update endpoint when API is ready
    return apiClient.post(`/pets/${id}/favorite/`);
  },
};

// We'll no longer need the commentsApi but keeping the structure
export const commentsApi = {
  // ...existing code...
};

export default apiClient;
