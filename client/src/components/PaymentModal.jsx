import React, { useMemo, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { paymentAPI } from "../utils/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price || 0);

const PaymentModal = ({ isOpen, onClose, product }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const productName = useMemo(
    () => product?.name || "Selected Product",
    [product],
  );
  const productPrice = useMemo(() => Number(product?.price || 0), [product]);

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phoneDigits = form.phone.replace(/\D/g, "");
    const address = form.address.trim();

    if (name.length < 2) {
      return "Full Name is required and must be at least 2 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (phoneDigits.length < 10) {
      return "Phone number must contain at least 10 digits.";
    }

    if (address.length < 5) {
      return "Address is required and must be at least 5 characters.";
    }

    return "";
  };

  const handlePay = async () => {
    setError("");

    if (!product?._id) {
      setError("No product selected for payment.");
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setProcessing(true);

    try {
      const response = await paymentAPI.initiate(product._id, productPrice, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        country: "Bangladesh",
      });

      if (response.success && response.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
        return;
      }

      setError(
        response.message || "Unable to start payment. Please try again.",
      );
    } catch (apiError) {
      setError(
        apiError?.message || "Payment initiation failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) {
      return;
    }
    setError("");
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      <aside
        className={`fixed top-0 right-0 z-[310] h-full w-full max-w-[460px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Buy Now
            </h2>
            <p className="text-sm text-gray-500">Complete secure payment</p>
          </div>
          <button
            onClick={handleClose}
            disabled={processing}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800 disabled:opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Product
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">
            {productName}
          </h3>
          <p className="mt-1 text-2xl font-black text-gray-900">
            {formatPrice(productPrice)}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="House, road, area"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City (optional)
            </label>
            <input
              value={form.city}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, city: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Dhaka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode (optional)
            </label>
            <input
              value={form.postcode}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, postcode: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="1207"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              value="Bangladesh"
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white px-6 py-5 space-y-3">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>

          <button
            onClick={handleClose}
            disabled={processing}
            className="w-full inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </aside>
    </>
  );
};

export default PaymentModal;
