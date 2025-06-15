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
    console.log('🔍 Request interceptor - Token check:');
    console.log('  - Token exists:', !!token);
    console.log('  - Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('  - Request URL:', config.url);
    console.log('  - Request method:', config.method);
      if (token) {
      // Django Rest Framework expects "Token <token>" format, not "Bearer <token>"
      config.headers['Authorization'] = `Token ${token}`;
      console.log('  ✅ Authorization header set:', config.headers['Authorization'].substring(0, 30) + '...');
    } else {
      console.warn('  ❌ No token found in localStorage for API request');
      console.log('  - Current localStorage keys:', Object.keys(localStorage));
    }
    
    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  response => {
    console.log('✅ API Response successful:', response.status, response.config.url);
    return response;
  },
  error => {
    console.log('❌ API Response error details:');
    console.log('  - Status:', error.response?.status);
    console.log('  - URL:', error.config?.url);
    console.log('  - Method:', error.config?.method);
    console.log('  - Response data:', error.response?.data);
    console.log('  - Request headers:', error.config?.headers);
    
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - Clearing local storage and redirecting');
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service for pets
export const cardsApi = {
  /**
   * Get all available pets
   * @returns {Promise<Array>} - Promise resolving to array of pet objects
   */  getAllCards: () => {
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
    
    // Check if token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return Promise.reject(new Error('Authentication required'));
    }
    
    // Simple GET request to the API endpoint
    return apiClient.get('/animales/')
      .then(response => {
        console.log('API Response received:', response.status);
        console.log('Animals data:', response.data);
        return response;
      })
      .catch(error => {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // For authentication errors, don't fall back to mock data
        if (error.response?.status === 401) {
          throw error;
        }
        
        // For other errors, fall back to mock data
        console.warn('Falling back to mock data due to API error');
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
    
    // Check if token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found for pet details');
      return Promise.reject(new Error('Authentication required'));
    }
    
    // Simple GET request to the API endpoint
    return apiClient.get(`/animales/${id}/`)
      .then(response => {
        console.log('Pet details API Response received:', response.status);
        return response;
      })
      .catch(error => {
        console.error('Pet details API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // For authentication errors, don't fall back to mock data
        if (error.response?.status === 401) {
          throw error;
        }
        
        // In case of error, we still return mock data as fallback
        const pet = mockupPets.find(p => p.id == id);
        if (pet) {
          console.warn('Falling back to mock data for pet details');
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
    
    // Check if token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found for liking pet');
      return Promise.reject(new Error('Authentication required'));
    }
    
    // This endpoint will need to be implemented in the backend
    return apiClient.post(`/animales/${id}/favorito/`)
      .catch(error => {
        console.error('Like pet API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  },
};

// Authentication API endpoints
export const authApi = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Promise resolving to { token, user, message }
   */
  login: (credentials) => {
    return axios.post(`${config.api.baseUrl}/auth/login/`, credentials, {
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true",
      }
    });
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Promise resolving to { token, user, message }
   */
  register: (userData) => {
    return axios.post(`${config.api.baseUrl}/auth/register/`, userData, {
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true",
      }
    });
  },
  /**
   * Get current user profile (TO-DO)
   * @returns {Promise<Object>} - Promise resolving to user profile
   */
  getProfile: () => {
    // Use apiClient which already has the Authorization header interceptor
    return apiClient.get('/usuarios/profile/')
      .catch(error => {
        console.error('Get profile API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  },
  /**
   * Logout user (if backend has logout endpoint)
   * @returns {Promise<Object>} - Promise resolving to logout confirmation
   */
  logout: () => {
    // Use apiClient which already has the Authorization header interceptor
    return apiClient.post('/auth/logout/', {})
      .catch(error => {
        console.error('Logout API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        // For logout, we don't necessarily need to throw the error
        // as the local cleanup will happen regardless
        return { data: { success: false, message: 'Logout failed but local session cleared' } };
      });
  },

  /**
   * Check if email is available for registration
   * @param {string} email - Email to check
   * @returns {Promise<Object>} - Promise resolving to { available: boolean, email: string }
   */
  checkEmailAvailability: (email) => {
    return axios.get(`${config.api.baseUrl}/auth/check-email/`, {
      params: { email },
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true",
      }
    });
  },
};

// Backoffice API endpoints for EMPRESA users
export const backofficeApi = {
  /**
   * Get all pets owned by the current company
   * @returns {Promise<Array>} - Promise resolving to array of company's pets
   */
  getCompanyPets: () => {
    return apiClient.get('/animales/')
      .then(response => {
        console.log('Company pets API Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Company pets API Error:', error);
        throw error;
      });
  },

  /**
   * Get all petitions for the company's animals
   * @returns {Promise<Array>} - Promise resolving to array of petitions
   */
  getCompanyPetitions: () => {
    return apiClient.get('/peticiones/')
      .then(response => {
        console.log('Company petitions API Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Company petitions API Error:', error);
        throw error;
      });
  },

  /**
   * Get petitions for a specific animal
   * @param {string|number} animalId - The animal ID
   * @returns {Promise<Array>} - Promise resolving to array of petitions for the animal
   */
  getAnimalPetitions: (animalId) => {
    return apiClient.get('/peticiones/')
      .then(response => {
        // Filter petitions for the specific animal
        const filteredPetitions = response.data.filter(petition => petition.animal === animalId);
        return { ...response, data: filteredPetitions };
      })
      .catch(error => {
        console.error('Animal petitions API Error:', error);
        throw error;
      });
  },

  /**
   * Get a single animal by ID
   * @param {string|number} animalId - The animal ID
   * @returns {Promise<Object>} - Promise resolving to animal object
   */
  getAnimal: (animalId) => {
    return apiClient.get(`/animales/${animalId}/`)
      .then(response => {
        console.log('Get animal API Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Get animal API Error:', error);
        throw error;
      });
  },

  /**
   * Update a petition status (accept/reject)
   * @param {string|number} petitionId - The petition ID
   * @param {object} updateData - { estado: 'Aceptada'|'Rechazada', leida: boolean }
   * @returns {Promise<Object>} - Promise resolving to updated petition
   */
  updatePetition: (petitionId, updateData) => {
    return apiClient.patch(`/peticiones/${petitionId}/`, updateData)
      .then(response => {
        console.log('Update petition API Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Update petition API Error:', error);
        throw error;
      });
  },
  /**
   * Create a new animal
   * @param {FormData|object} animalData - Animal data including form data for images
   * @returns {Promise<Object>} - Promise resolving to created animal
   */
  createAnimal: (animalData) => {
    // If animalData is already FormData, use it directly
    if (animalData instanceof FormData) {
      return apiClient.post('/animales/', animalData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    // If images are included, use FormData
    const hasImages = Object.keys(animalData).some(key => key.includes('imagen') && key.includes('file'));
    
    if (hasImages) {
      const formData = new FormData();
      Object.keys(animalData).forEach(key => {
        if (animalData[key] !== null && animalData[key] !== undefined) {
          formData.append(key, animalData[key]);
        }
      });

      return apiClient.post('/animales/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return apiClient.post('/animales/', animalData);
    }
  },
  /**
   * Update an existing animal
   * @param {string|number} animalId - The animal ID
   * @param {FormData|object} animalData - Updated animal data
   * @returns {Promise<Object>} - Promise resolving to updated animal
   */
  updateAnimal: (animalId, animalData) => {
    // If animalData is already FormData, use it directly
    if (animalData instanceof FormData) {
      return apiClient.patch(`/animales/${animalId}/`, animalData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    // If images are included, use FormData
    const hasImages = Object.keys(animalData).some(key => key.includes('imagen') && key.includes('file'));
    
    if (hasImages) {
      const formData = new FormData();
      Object.keys(animalData).forEach(key => {
        if (animalData[key] !== null && animalData[key] !== undefined) {
          formData.append(key, animalData[key]);
        }
      });

      return apiClient.patch(`/animales/${animalId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return apiClient.patch(`/animales/${animalId}/`, animalData);
    }
  },

  /**
   * Delete an animal
   * @param {string|number} animalId - The animal ID
   * @returns {Promise<Object>} - Promise resolving to deletion confirmation
   */
  deleteAnimal: (animalId) => {
    return apiClient.delete(`/animales/${animalId}/`)
      .then(response => {
        console.log('Delete animal API Response:', response.status);
        return response;
      })
      .catch(error => {
        console.error('Delete animal API Error:', error);
        throw error;
      });
  }
};

// Contact API endpoints
export const contactApi = {
  /**
   * Submit contact form for shelters/companies
   * @param {Object} contactData - Contact form data
   * @returns {Promise<Object>} - Promise resolving to submission confirmation
   */
  submitContactForm: (contactData) => {
    return apiClient.post('/empresa/', contactData)
      .then(response => {
        console.log('Contact form API Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Contact form API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  },

  /**
   * Submit general inquiry from help page
   * @param {Object} inquiryData - General inquiry data { email, mensaje }
   * @returns {Promise<Object>} - Promise resolving to submission confirmation
   */
  submitGeneralInquiry: (inquiryData) => {
    return apiClient.post('/consulta/', inquiryData)
      .then(response => {
        console.log('General inquiry API Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('General inquiry API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  }
};

export default apiClient;
