import React, { useState } from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price || 0);

const CartDrawer = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    loading,
    actionLoading,
    error,
    successMessage,
    setError,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    const order = await checkout();
    setCheckingOut(false);
    if (order) setOrderSuccess(order);
  };

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[210] h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-blue-600" />
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
            <CheckCircle size={16} className="shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Order Success */}
        {orderSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">Order Placed!</h3>
              <p className="mt-1 text-gray-500 text-sm">
                Order ID:{" "}
                <span className="font-bold text-gray-700">{orderSuccess.orderId}</span>
              </p>
            </div>
            <div className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-5 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(orderSuccess.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (8%)</span>
                <span className="font-semibold">{formatPrice(orderSuccess.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-black text-blue-600 text-lg">{formatPrice(orderSuccess.total)}</span>
              </div>
            </div>
            <button
              onClick={() => { setOrderSuccess(null); closeCart(); }}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : !isAuthenticated ? (
          /* Not logged in */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <ShoppingBag size={36} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Sign in to view your cart</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Your cart will be saved and synced across devices.
              </p>
            </div>
            <Link
              to="/login"
              onClick={closeCart}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={closeCart}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              Create an account
            </Link>
          </div>
        ) : items.length === 0 ? (
          /* Empty cart */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Your cart is empty</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Add some products and they'll show up here.
              </p>
            </div>
            <button
              onClick={closeCart}
              className="px-8 py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-blue-600 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Clear all button */}
              <div className="flex justify-end mb-1">
                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Trash2 size={12} />
                  Clear all
                </button>
              </div>

              {items.map((item) => {
                const isItemLoading = actionLoading[item.productId];
                return (
                  <div
                    key={item.productId}
                    className={`flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-opacity ${
                      isItemLoading ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        {item.brand}
                      </p>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-black text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(item.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50">
                          <button
                            onClick={() =>
                              item.quantity === 1
                                ? removeFromCart(item.productId)
                                : updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={isItemLoading}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors disabled:opacity-40"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 size={13} />
                            ) : (
                              <Minus size={13} />
                            )}
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-gray-900">
                            {isItemLoading ? (
                              <Loader2 size={13} className="animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={isItemLoading}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-40"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-sm font-black text-gray-700">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer - summary */}
            <div className="border-t border-gray-100 bg-white px-5 py-5 space-y-4">
              {/* Promo */}
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                <Tag size={15} />
                <span>Add promo code</span>
                <ChevronRight size={14} className="ml-auto" />
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 text-base">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-blue-600 text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut || loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout — {formatPrice(total)}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Secure checkout · SSL encrypted
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
