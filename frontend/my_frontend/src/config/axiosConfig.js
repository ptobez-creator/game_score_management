import axios from 'axios';
import { API_URL, LOCAL_API_URL } from './runtimeConfig';

// In production (built app), use relative URLs which will be proxied by nginx to the backend
// In development, use the configured API_URL
const isDevelopment = process.env.NODE_ENV === 'development';
axios.defaults.baseURL = isDevelopment ? API_URL : '';

axios.interceptors.request.use(
  (config) => {
    if (typeof config.url === 'string' && config.url.startsWith(LOCAL_API_URL)) {
      config.url = config.url.replace(LOCAL_API_URL, isDevelopment ? API_URL : '');
    }

    return config;
  },
  (error) => Promise.reject(error)
);
