import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

export const fetchProducts = () => API.get('/products');
export const fetchProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const createOrder = (orderData) => API.post('/orders', orderData);
export const fetchMyOrders = () => API.get('/orders/acheteur');
export const fetchSellerOrders = () => API.get('/orders/fournisseur');
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/statut`, { statut: status });
