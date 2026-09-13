import { createSlice } from '@reduxjs/toolkit';

// Discount tier logic
const computeDiscount = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (subtotal >= 2499) return { percent: 10, threshold: 2499 };
  if (subtotal >= 1499) return { percent: 5, threshold: 1499 };
  if (subtotal >= 999) return { percent: 3, threshold: 999 };
  return { percent: 0, threshold: 999 };
};

const cartFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: cartFromStorage,
    coupon: null,
    isOpen: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, qty = 1, size } = action.payload;
      const key = `${product._id}-${size}`;
      const existingIndex = state.cartItems.findIndex(
        (i) => i._id === product._id && i.size === size
      );
      if (existingIndex >= 0) {
        state.cartItems[existingIndex].qty += qty;
      } else {
        state.cartItems.push({
          _id: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price,
          size,
          qty,
          slug: product.slug,
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const { id, size } = action.payload;
      state.cartItems = state.cartItems.filter((i) => !(i._id === id && i.size === size));
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateQty: (state, action) => {
      const { id, size, qty } = action.payload;
      const item = state.cartItems.find((i) => i._id === id && i.size === size);
      if (item) {
        item.qty = Math.max(1, qty);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.coupon = null;
      localStorage.removeItem('cartItems');
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    removeCoupon: (state) => {
      state.coupon = null;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart, applyCoupon, removeCoupon, toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartCount = (state) => state.cart.cartItems.reduce((sum, i) => sum + i.qty, 0);
export const selectCartSubtotal = (state) =>
  state.cart.cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
export const selectDiscount = (state) => computeDiscount(state.cart.cartItems);
export const selectCoupon = (state) => state.cart.coupon;
export const selectIsCartOpen = (state) => state.cart.isOpen;
