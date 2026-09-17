import { createContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('kanha_cart');
    return localData ? JSON.parse(localData) : [];
  });
  const [cartDetails, setCartDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBackendCart = useCallback(async () => {
    const token = localStorage.getItem('kanha_access_token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setCartDetails(data);
        const mappedItems = (data.items || []).map(item => ({
          id: item.id,
          variantId: item.variantId,
          title: item.productTitle,
          price: item.unitPrice,
          qty: item.quantity,
          image: item.imageUrl,
          size: item.size,
          color: item.color,
          sku: item.sku,
          isAvailable: item.isAvailable,
        }));
        setCartItems(mappedItems);
      }
    } catch (err) {
      console.warn('Backend cart fetch fallback to localStorage:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendCart();
  }, [fetchBackendCart]);

  useEffect(() => {
    localStorage.setItem('kanha_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, variantId, qty = 1) => {
    const token = localStorage.getItem('kanha_access_token');
    if (token && (variantId || product?.variantId || product?.id)) {
      const targetVariantId = variantId || product.variantId || product.id;
      try {
        await cartApi.addItem(targetVariantId, qty);
        await fetchBackendCart();
        return;
      } catch (err) {
        console.error('Backend addToCart error:', err);
      }
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id || item.variantId === variantId);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id || item.variantId === variantId)
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { ...product, variantId: variantId || product.id, qty }];
    });
  };

  const removeFromCart = async (id, cartItemId) => {
    const token = localStorage.getItem('kanha_access_token');
    if (token && cartItemId) {
      try {
        await cartApi.removeItem(cartItemId);
        await fetchBackendCart();
        return;
      } catch (err) {
        console.error('Backend removeItem error:', err);
      }
    }
    setCartItems(prev => prev.filter(item => item.id !== id && item.id !== cartItemId));
  };

  const updateQty = async (id, amount, cartItemId) => {
    const targetItem = cartItems.find(item => item.id === id || item.id === cartItemId);
    if (!targetItem) return;

    const newQty = targetItem.qty + amount;
    if (newQty <= 0) {
      await removeFromCart(id, cartItemId);
      return;
    }

    const token = localStorage.getItem('kanha_access_token');
    if (token && cartItemId) {
      try {
        await cartApi.updateQuantity(cartItemId, newQty);
        await fetchBackendCart();
        return;
      } catch (err) {
        console.error('Backend updateQuantity error:', err);
      }
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id || item.id === cartItemId) {
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = async () => {
    const token = localStorage.getItem('kanha_access_token');
    if (token) {
      try {
        await cartApi.clearCart();
        await fetchBackendCart();
      } catch (err) {
        console.error('Backend clearCart error:', err);
      }
    }
    setCartItems([]);
    setCartDetails(null);
  };

  const totalItems = cartDetails?.totalItemCount ?? cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subTotal = cartDetails?.subTotal ?? cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shippingFee = cartDetails?.estimatedShippingFee ?? (subTotal >= 999 || subTotal === 0 ? 0 : 99);
  const finalTotal = cartDetails?.estimatedTotal ?? (subTotal + shippingFee);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartDetails,
      loading,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      fetchBackendCart,
      subTotal,
      shippingFee,
      finalTotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
