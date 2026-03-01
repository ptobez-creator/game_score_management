import axios from 'axios';
import { API_URL, LOCAL_API_URL } from './runtimeConfig';

axios.defaults.baseURL = API_URL;

axios.interceptors.request.use(
  (config) => {
    if (typeof config.url === 'string' && config.url.startsWith(LOCAL_API_URL)) {
      config.url = config.url.replace(LOCAL_API_URL, API_URL);
    }

    return config;
  },
  (error) => Promise.reject(error)
);
