import axios from 'axios';

// With Vite proxy, we use relative URLs — no hardcoded port needed
const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let components handle specific errors; don't force redirect here
    return Promise.reject(error);
  }
);

export default api;
