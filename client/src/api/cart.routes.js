import axiosAuth from '../axios/axiosAuth';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchCart = async () => {
  try {
    const response = await axiosAuth.get(`${API_URL}/cart`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addCartItem = async (productId, quantity = 1) => {
  try {
    const response = await axiosAuth.post(`${API_URL}/cart/items`, { productId, quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await axiosAuth.put(`${API_URL}/cart/items/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeCartItem = async (productId) => {
  try {
    const response = await axiosAuth.delete(`${API_URL}/cart/items/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const clearCartApi = async () => {
  try {
    const response = await axiosAuth.delete(`${API_URL}/cart`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
