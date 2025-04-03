import axios  from 'axios';
import { useNavigate } from 'react-router-dom';

const axiosBackendInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

axiosBackendInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosBackendInstance.interceptors.response.use((response) => {
    console.log('Response:', response)
    //if respose includws token, save it to local storage
    if (response.data.access && response.data.refresh) {
        localStorage.setItem('refresh', response.data.refresh)
        localStorage.setItem('access', response.data.access)
    }
    return response;
}, (error) => {
    if (error.response.status === 401) {
        // TODO utilize refresh token instead of logging out
        const navigate = useNavigate()
        localStorage.removeItem('access')
        navigate('/login')
    }
    console.log('Error:', error)
    return Promise.reject(error);
})

export { axiosBackendInstance }