import React, { useEffect, useState } from "react";
import {
  Package, ChevronDown, ChevronUp, ShoppingBag,
  Clock, CheckCircle, Truck, MapPin, RefreshCw, Star
} from "lucide-react";
import Container from "../components/layout/Container/Container";
import { orderAPI } from "../utils/api";
import { Link } from "react-router-dom";

const formatPrice = (p) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(p || 0);

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: <Clock size={13} /> },
  confirmed:  { label: "Confirmed",  color: "text-blue-700 bg-blue-50 border-blue-200",       icon: <CheckCircle size={13} /> },
  processing: { label: "Processing", color: "text-purple-700 bg-purple-50 border-purple-200", icon: <Package size={13} /> },
  shipped:    { label: "Shipped",    color: "text-teal-700 bg-teal-50 border-teal-200",        icon: <Truck size={13} /> },
  delivered:  { label: "Delivered",  color: "text-green-700 bg-green-50 border-green-200",    icon: <CheckCircle size={13} /> },
  cancelled:  { label: "Cancelled",  color: "text-red-700 bg-red-50 border-red-200",          icon: <Clock size={13} /> },
};

// Progress bar for order status
const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"];
const StatusProgress = ({ status }) => {
  const currentIdx = STATUS_STEPS.indexOf(status);
  if (status === "cancelled" || currentIdx === -1) return null;
  return (
    <div className="flex items-center gap-1 mt-4">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        return (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-1.5 ${done ? "text-blue-600" : "text-gray-300"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`hidden sm:block text-xs font-semibold capitalize ${done ? "text-blue-700" : "text-gray-400"}`}>{step}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < currentIdx ? "bg-blue-500" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row — clickable to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-start sm:items-center justify-between text-left hover:bg-gray-50/70 transition gap-4"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="bg-blue-50 rounded-xl p-3 text-blue-600 shrink-0">
            <Package size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-gray-900 text-sm sm:text-base truncate">{order.orderId}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
          <span className="font-black text-gray-900 text-base sm:text-lg">{formatPrice(order.total)}</span>
          <div className="text-gray-400">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Expanded order detail */}
      {open && (
        <div className="border-t border-gray-100 p-5 space-y-5">

          {/* Status progress bar */}
          <StatusProgress status={order.status} />

          {/* Order items — ✅ FIXED: each item links to its product detail page */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Items</h4>
            {order.items?.map((item, i) => (
              <Link
                key={i}
                to={item.productId ? `/product/${item.productId}` : "#"}
                onClick={(e) => { if (!item.productId) e.preventDefault(); }}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.brand} · Qty: {item.quantity}</p>
                  <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  {item.productId && (
                    <p className="text-xs text-blue-500 group-hover:underline mt-0.5">View product →</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Delivery address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-blue-600" /> Delivery Address
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip, order.shippingAddress.country]
                  .filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          {/* Price summary */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Estimated delivery */}
          {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2 text-sm text-blue-700">
              <Truck size={16} />
              <span>Estimated delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></span>
            </div>
          )}

          {/* Rate this order prompt (delivered only) */}
          {order.status === "delivered" && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">How was your order?</span>
              </div>
              <Link
                to={order.items?.[0]?.productId ? `/product/${order.items[0].productId}` : "/"}
                className="text-xs font-bold text-yellow-700 hover:underline"
              >
                Leave a review →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderAPI.getOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => setError(e?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBag size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Order History</h1>
              {!loading && orders.length > 0 && (
                <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
              )}
            </div>
          </div>
          <Link to="/" className="text-sm text-blue-600 hover:underline font-semibold hidden sm:block">
            Continue Shopping →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5 flex items-center gap-3">
            <RefreshCw size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package size={36} className="text-blue-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">When you place an order, it'll show up here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
};

export default OrderHistory;
