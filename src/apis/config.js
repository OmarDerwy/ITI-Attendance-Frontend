import axios from "axios";
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = document.cookie
    //   .split('; ')
    //   .find(row => row.startsWith('token='))
    //   ?.split('=')[1];
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ0MTQ3NjQzLCJpYXQiOjE3NDM1NDI4NDMsImp0aSI6IjJmZjA2NDQ4OTMxNjRiMGFiZmY2ZTQxMTU2NWMxOWEyIiwidXNlcl9pZCI6MX0.hSXgOEBdHHTiMNybx8wt_cTFNhoTD30FbpBUcyfzOQY" ;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default axiosInstance;