import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return { items: [] };
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load cart from localStorage', e);
    return { items: [] };
  }
};

const saveCartToStorage = (state) => {
  try {
    localStorage.setItem('cart', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      saveCartToStorage(state);
    },
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity = Math.min((existing.quantity || 0) + quantity, product.stock || 9999);
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || null,
          quantity: Math.max(1, Math.min(quantity, product.stock || 9999)),
        });
      }
      saveCartToStorage(state);
    },
    removeItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((i) => i.productId !== productId);
      saveCartToStorage(state);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity = Math.max(1, quantity);
      }
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state);
    },
  },
});

export const { setCart, addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
