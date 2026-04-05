import React, { useState } from "react";
import {
  ShoppingBag, Trash2, Minus, Plus, ArrowLeft, Tag,
  ShieldCheck, Truck, RefreshCw, CheckCircle, AlertCircle,
  Loader2, X, Package
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, offerAPI } from "../utils/api";
import Container from "../components/layout/Container/Container";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price || 0);

const CartPage = () => {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart, loading, actionLoading, error, successMessage, setError } = useCart();
  const { isAuthenticated } = useAuth();
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const discount = promoData
    ? promoData.discountType === "percentage"
      ? +(subtotal * (promoData.discountValue / 100)).toFixed(2)
      : Math.min(promoData.discountValue, subtotal)
    : 0;

  const taxBase = subtotal - discount;
  const tax = +(taxBase * 0.08).toFixed(2);
  const total = +(taxBase + tax).toFixed(2);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const data = await offerAPI.validateCode(promoInput.trim());
      if (data.minOrderAmount && subtotal < data.minOrderAmount) {
        setPromoError(`Minimum order of ${formatPrice(data.minOrderAmount)} required for this code.`);
        setPromoData(null);
      } else {
        setPromoData(data);
      }
    } catch (e) {
      setPromoError(e?.message || "Invalid promo code");
      setPromoData(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => { setPromoData(null); setPromoInput(""); setPromoError(""); };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const order = await orderAPI.placeOrder({ promoCode: promoData?.code || null });
      // Clear cart state locally
      await clearCart().catch(() => {});
      setOrderSuccess(order);
    } catch (e) {
      setError(e?.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <Container>
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-6">
              Your order <span className="font-mono font-bold text-blue-600">{orderSuccess.orderId}</span> has been placed.
            </p>
            <div className="bg-gray-50 rounded-2xl p-5 text-sm text-left space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatPrice(orderSuccess.subtotal)}</span></div>
              {orderSuccess.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(orderSuccess.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="font-semibold">{formatPrice(orderSuccess.tax)}</span></div>
              <div className="flex justify-between font-black text-lg pt-1 border-t border-gray-200"><span>Total</span><span>{formatPrice(orderSuccess.total)}</span></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/orders" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 justify-center">
                <Package size={18} /> View Orders
              </Link>
              <Link to="/" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-gray-400 hover:text-blue-600 transition"><ArrowLeft size={22} /></Link>
          <h1 className="text-3xl font-black text-gray-900">Shopping Cart</h1>
          {itemCount > 0 && <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">{itemCount} items</span>}
        </div>

        {(error || successMessage) && (
          <div className={`mb-6 rounded-2xl p-4 flex items-start gap-3 ${error ? "bg-red-50 border border-red-100 text-red-700" : "bg-green-50 border border-green-100 text-green-700"}`}>
            {error ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle size={18} className="shrink-0 mt-0.5" />}
            <p className="text-sm font-medium">{error || successMessage}</p>
            <button onClick={() => setError("")} className="ml-auto"><X size={16} /></button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const busy = actionLoading[item.productId];
                return (
                  <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                    <Link to={`/product/${item.productId}`}>
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0 hover:opacity-80 transition" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase">{item.brand}</p>
                          <Link to={`/product/${item.productId}`}>
                            <h3 className="font-bold text-gray-900 hover:text-blue-600 transition">{item.name}</h3>
                          </Link>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} disabled={busy} className="text-gray-300 hover:text-red-500 transition shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={busy || item.quantity <= 1} className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40">
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1.5 font-bold text-gray-900 min-w-[32px] text-center text-sm">
                            {busy ? <Loader2 size={14} className="animate-spin mx-auto" /> : item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={busy} className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40">
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                          {item.compareAtPrice > item.price && (
                            <p className="text-xs text-gray-400 line-through">{formatPrice(item.compareAtPrice * item.quantity)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button onClick={clearCart} disabled={loading} className="text-sm text-red-500 hover:text-red-700 transition flex items-center gap-1.5">
                <Trash2 size={14} /> Clear entire cart
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Promo code */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Tag size={16} className="text-blue-600" /> Promo Code</h3>
                {promoData ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-green-700 text-sm">{promoData.code}</p>
                      <p className="text-xs text-green-600">{promoData.title}</p>
                    </div>
                    <button onClick={removePromo} className="text-green-400 hover:text-red-500"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Enter code"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={applyPromo} disabled={promoLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition">
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-600 mt-2">{promoError}</p>}
                <Link to="/deals" className="text-xs text-blue-600 hover:underline mt-2 block">Browse available deals →</Link>
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600 font-semibold">Free</span></div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-lg text-gray-900">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || loading}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-black transition flex items-center justify-center gap-2"
                  >
                    {checkingOut ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Place Order"}
                  </button>
                ) : (
                  <div className="mt-5 space-y-2">
                    <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-center transition">
                      Login to Checkout
                    </Link>
                    <p className="text-xs text-gray-400 text-center">You must be logged in to place an order</p>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                {[<ShieldCheck size={20} />, <Truck size={20} />, <RefreshCw size={20} />].map((icon, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-blue-600">{icon}</span>
                    <span>{["Secure Pay", "Free Ship", "Easy Return"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
};

export default CartPage;
