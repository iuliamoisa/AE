import axiosAuth from '../axios/axiosAuth';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchOrders = async () => {
  try {
    const response = await axiosAuth.get(`${API_URL}/orders`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchMyOrders = async () => {
  try {
    const response = await axiosAuth.get(`${API_URL}/orders/my-orders`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await axiosAuth.get(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axiosAuth.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (id, orderData) => {
  try {
    const response = await axiosAuth.put(`${API_URL}/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await axiosAuth.delete(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
