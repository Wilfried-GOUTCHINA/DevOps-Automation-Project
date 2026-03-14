import axios from 'axios';

// Utilise la variable d'env si disponible, sinon l'URL fixe de ton backend
const API_URL = process.env.REACT_APP_API_URL || 'https://devops-automation-project.onrender.com/api';

const API = axios.create({
  baseURL: API_URL
});

// Intercepteur pour le token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Fonctions API
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchProducts = () => API.get('/products');
export const fetchProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const createOrder = (orderData) => API.post('/orders', orderData);
export const fetchMyOrders = () => API.get('/orders/acheteur');
export const fetchSellerOrders = () => API.get('/orders/fournisseur');

export default API;
