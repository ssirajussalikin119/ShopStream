/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { cartAPI, orderAPI } from "../utils/api";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], itemCount: 0, subtotal: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // per-product loading
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], itemCount: 0, subtotal: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      setCart(data);
    } catch {
      // silently fail on initial load
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync on login/logout
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        setError("Please log in to add items to your cart.");
        return false;
      }
      setActionLoading((prev) => ({ ...prev, [productId]: true }));
      setError("");
      try {
        const data = await cartAPI.addItem(productId, quantity);
        setCart(data);
        setIsCartOpen(true);
        showSuccess("Item added to cart!");
        return true;
      } catch (err) {
        setError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to add item to cart."
        );
        return false;
      } finally {
        setActionLoading((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [isAuthenticated]
  );

  // Update quantity
  const updateQuantity = useCallback(async (productId, quantity) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    setError("");
    try {
      const data = await cartAPI.updateItem(productId, quantity);
      setCart(data);
    } catch (err) {
      setError(
        typeof err === "string" ? err : err?.message || "Failed to update cart."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }, []);

  // Remove item
  const removeFromCart = useCallback(async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    setError("");
    try {
      const data = await cartAPI.removeItem(productId);
      setCart(data);
      showSuccess("Item removed from cart.");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to remove item."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cartAPI.clearCart();
      setCart(data);
      showSuccess("Cart cleared.");
    } catch (err) {
      setError(
        typeof err === "string" ? err : err?.message || "Failed to clear cart."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Checkout — accepts optional payload (promoCode, shippingAddress, etc.)
  const checkout = useCallback(async (payload = {}) => {
    setLoading(true);
    setError("");
    try {
      const order = await orderAPI.placeOrder(payload);
      setCart({ items: [], itemCount: 0, subtotal: 0 });
      setIsCartOpen(false);
      return order;
    } catch (err) {
      setError(
        typeof err === "string" ? err : err?.message || "Checkout failed."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const itemCount =
    cart.itemCount ??
    cart.items?.reduce((sum, item) => sum + item.quantity, 0) ??
    0;

  const subtotal =
    cart.subtotal ??
    cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ??
    0;

  const isInCart = (productId) =>
    cart.items?.some((i) => i.productId?.toString() === productId?.toString());

  const getItemQuantity = (productId) => {
    const item = cart.items?.find(
      (i) => i.productId?.toString() === productId?.toString()
    );
    return item?.quantity ?? 0;
  };

  const value = {
    cart,
    items: cart.items || [],
    itemCount,
    subtotal,
    isCartOpen,
    loading,
    actionLoading,
    error,
    successMessage,
    setError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    openCart,
    closeCart,
    fetchCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
