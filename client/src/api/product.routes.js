import axiosNoAuth from "../axios/axiosNoAuth";

export const fetchProducts = async () => {
  try {
    const response = await axiosNoAuth.get('products');
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return error.response?.data;
  }
};