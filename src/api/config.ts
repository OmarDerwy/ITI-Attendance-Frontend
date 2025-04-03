import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Create an Axios instance with custom config
export const axiosBackendInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token
axiosBackendInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
axiosBackendInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const navigate = useNavigate()
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Attempt to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/'}/accounts/auth/jwt/refresh/`,
          { refresh: refreshToken }
        );
        
        // Update the stored access token
        localStorage.setItem('access', response.data.access);
        
        // Update the Authorization header and retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axiosBackendInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear the tokens and redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate ('/login')
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosBackendInstance;
