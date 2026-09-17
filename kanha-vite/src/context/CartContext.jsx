import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('kanha_cart');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('kanha_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    toast('✅ Added to cart!');
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, amount) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + amount;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Discount tiers: 3% off ₹999+, 5% off ₹1499+, 10% off ₹2499+
  let discountPercent = 0;
  if (subTotal >= 2499) discountPercent = 10;
  else if (subTotal >= 1499) discountPercent = 5;
  else if (subTotal >= 999) discountPercent = 3;

  const discountAmount = Math.round((subTotal * discountPercent) / 100);
  const finalTotal = subTotal - discountAmount;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQty,
      subTotal,
      discountPercent,
      discountAmount,
      finalTotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
