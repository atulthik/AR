const API_URL = 'http://localhost:5000/api';

/**
 * Helper to fetch headers containing Auth token if present
 */
const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const api = {
  // Authentication services
  auth: {
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      return response.json();
    },
    login: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });
      return response.json();
    },
    getProfile: async () => {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
    getWishlist: async () => {
      const response = await fetch(`${API_URL}/auth/wishlist`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
    addToWishlist: async (furnitureId) => {
      const response = await fetch(`${API_URL}/auth/wishlist/${furnitureId}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return response.json();
    },
    removeFromWishlist: async (furnitureId) => {
      const response = await fetch(`${API_URL}/auth/wishlist/${furnitureId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return response.json();
    },
  },

  // Furniture Catalog services
  furniture: {
    getAll: async (search = '', category = 'All') => {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category && category !== 'All') queryParams.append('category', category);
      
      const response = await fetch(`${API_URL}/furniture?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/furniture/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
    create: async (formData) => {
      const response = await fetch(`${API_URL}/furniture`, {
        method: 'POST',
        headers: getHeaders(true), // Let fetch set the boundary for multipart form data
        body: formData,
      });
      return response.json();
    },
    update: async (id, formData) => {
      const response = await fetch(`${API_URL}/furniture/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: formData,
      });
      return response.json();
    },
    delete: async (id) => {
      const response = await fetch(`${API_URL}/furniture/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return response.json();
    },
  },

  // Saved Designs services
  designs: {
    save: async (designData) => {
      const response = await fetch(`${API_URL}/designs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(designData),
      });
      return response.json();
    },
    getAll: async () => {
      const response = await fetch(`${API_URL}/designs`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/designs/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
  },

  // Admin Telemetry Analytics
  admin: {
    getAnalytics: async () => {
      const response = await fetch(`${API_URL}/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return response.json();
    },
  },
};

export default api;
export { API_URL };
