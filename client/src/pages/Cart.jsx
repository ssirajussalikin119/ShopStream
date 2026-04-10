import React, { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Container from "../components/layout/Container/Container";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price || 0);

const CartPage = () => {
  const {
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

  const tax = subtotal * 0.08;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    setCheckingOut(true);
    const order = await checkout();
    setCheckingOut(false);
    if (order) setOrderSuccess(order);
  };

  // ── Order Success ──────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-1">
              Order ID:{" "}
              <span className="font-bold text-gray-800">{orderSuccess.orderId}</span>
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Placed at {new Date(orderSuccess.placedAt).toLocaleString()}
            </p>

            {/* Order items */}
            <div className="text-left mb-6 space-y-3">
              {orderSuccess.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-600 uppercase">{item.brand}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-black text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-sm space-y-2 text-left mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(orderSuccess.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-semibold">{formatPrice(orderSuccess.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
                <span className="text-base font-black text-gray-900">Total Charged</span>
                <span className="text-xl font-black text-blue-600">
                  {formatPrice(orderSuccess.total)}
                </span>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  // ── Not logged in ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Sign in to view your cart</h1>
            <p className="text-gray-500 mb-8">
              Your cart is saved and synced once you're logged in.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything yet. Start shopping!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft size={18} />
              Browse Products
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  // ── Full cart ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container className="mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors font-semibold"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <h1 className="text-2xl font-black text-gray-900">
            Shopping Cart
            <span className="ml-2 text-base font-semibold text-gray-400">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 border border-green-100 px-5 py-4 text-sm text-green-700">
            <CheckCircle size={16} className="shrink-0" />
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ── Left: Items ── */}
          <div className="space-y-4">
            {/* Clear all */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
              >
                <Trash2 size={14} />
                Clear all items
              </button>
            </div>

            {items.map((item) => {
              const isItemLoading = actionLoading[item.productId];
              return (
                <div
                  key={item.productId}
                  className={`flex gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-opacity ${
                    isItemLoading ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {/* Image */}
                  <div className="h-28 w-28 shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-600 mb-1">
                      {item.brand}
                    </p>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 mb-3">SKU: {item.sku}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-gray-50 p-1">
                        <button
                          onClick={() =>
                            item.quantity === 1
                              ? removeFromCart(item.productId)
                              : updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={isItemLoading}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-white hover:text-red-500 transition-all disabled:opacity-40"
                        >
                          {item.quantity === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                        </button>
                        <span className="w-9 text-center text-sm font-black text-gray-900">
                          {isItemLoading ? (
                            <Loader2 size={14} className="animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isItemLoading}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-white hover:text-blue-600 transition-all disabled:opacity-40"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">
                            {formatPrice(item.price)} each
                          </p>
                        )}
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <p className="text-xs text-green-600 font-semibold">
                            Save {formatPrice((item.compareAtPrice - item.price) * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    disabled={isItemLoading}
                    className="self-start p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, label: "Free Shipping", sub: "On all orders" },
                { icon: RefreshCw, label: "Free Returns", sub: "30-day policy" },
                { icon: ShieldCheck, label: "Secure Checkout", sub: "SSL encrypted" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm"
                >
                  <Icon size={20} className="text-blue-500 mb-1" />
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Summary ── */}
          <div className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-24 space-y-5">
            <h2 className="text-lg font-black text-gray-900">Order Summary</h2>

            {/* Promo code */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button className="flex items-center gap-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors">
                <Tag size={14} />
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm">
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
              {/* Savings row */}
              {items.some(
                (i) => i.compareAtPrice && i.compareAtPrice > i.price
              ) && (
                <div className="flex justify-between text-green-600">
                  <span className="font-semibold">You save</span>
                  <span className="font-bold">
                    {formatPrice(
                      items.reduce(
                        (s, i) =>
                          i.compareAtPrice && i.compareAtPrice > i.price
                            ? s + (i.compareAtPrice - i.price) * i.quantity
                            : s,
                        0
                      )
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-blue-600 text-xl">{formatPrice(total)}</span>
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
                  <ShieldCheck size={18} />
                  Place Order — {formatPrice(total)}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By placing your order you agree to our{" "}
              <span className="underline cursor-pointer hover:text-blue-500">Terms</span> and{" "}
              <span className="underline cursor-pointer hover:text-blue-500">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default CartPage;
