import React, { useEffect, useState } from "react";
import { Package, ChevronDown, ChevronUp, ShoppingBag, Clock, CheckCircle, Truck } from "lucide-react";
import Container from "../components/layout/Container/Container";
import { orderAPI } from "../utils/api";
import { Link } from "react-router-dom";

const formatPrice = (p) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(p || 0);

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: <Clock size={14} /> },
  confirmed:  { label: "Confirmed",  color: "text-blue-600 bg-blue-50 border-blue-200",       icon: <CheckCircle size={14} /> },
  processing: { label: "Processing", color: "text-purple-600 bg-purple-50 border-purple-200", icon: <Package size={14} /> },
  shipped:    { label: "Shipped",    color: "text-teal-600 bg-teal-50 border-teal-200",        icon: <Truck size={14} /> },
  delivered:  { label: "Delivered",  color: "text-green-600 bg-green-50 border-green-200",    icon: <CheckCircle size={14} /> },
  cancelled:  { label: "Cancelled",  color: "text-red-600 bg-red-50 border-red-200",          icon: <Clock size={14} /> },
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 rounded-xl p-3 text-blue-600">
            <Package size={20} />
          </div>
          <div>
            <p className="font-black text-gray-900">{order.orderId}</p>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
          <span className="font-black text-gray-900 text-lg">{formatPrice(order.total)}</span>
          {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.brand} · Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2 text-sm text-blue-700">
              <Truck size={16} />
              <span>Estimated delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong></span>
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
      .then((data) => setOrders(data))
      .catch((e) => setError(e?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={28} className="text-blue-600" />
          <h1 className="text-3xl font-black text-gray-900">Order History</h1>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Package size={56} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-black text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">When you place an order, it'll show up here.</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </Container>
    </main>
  );
};

export default OrderHistory;
