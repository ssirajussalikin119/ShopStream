import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  authAPI,
  cartAPI,
  ordersAPI,
  profileAPI,
  wishlistAPI,
} from '../utils/api';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const isSellerAccount =
    user?.role === 'seller' ||
    user?.accountType === 'seller' ||
    user?.accountType === 'both';
  const [userData, setUserData] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isSellerAccount) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const [
          profileResponse,
          dashboardResponse,
          ordersResponse,
          wishlistResponse,
        ] = await Promise.all([
          authAPI.getMe(),
          profileAPI.getDashboard(),
          ordersAPI.getMyOrders(),
          wishlistAPI.getWishlist(),
        ]);

        if (profileResponse.success) {
          setUserData(profileResponse.data);
        }

        if (dashboardResponse.success) {
          setDashboard(dashboardResponse.data);
        }

        if (ordersResponse.success) {
          setOrders(ordersResponse.data || []);
        }

        if (wishlistResponse.success) {
          setWishlist(wishlistResponse.data?.items || []);
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isSellerAccount, token]);

  if (isSellerAccount) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            Seller Account Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Sellers manage their profile from the Seller Dashboard.
          </p>
          <div className="mt-6">
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Go to Seller Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const displayUser = userData || user;
  const accountOverview = dashboard?.accountOverview;
  const quickLinks = dashboard?.quickLinks || [];

  const handleReorder = async (orderId) => {
    try {
      const response = await ordersAPI.reorder(orderId);
      if (response.success) {
        setSuccessMessage('Order items moved to your cart.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reorder');
    }
  };

  const handleMoveWishlistToCart = async (productId) => {
    try {
      await cartAPI.addItem(productId, 1);
      const response = await wishlistAPI.removeItem(productId);
      if (response.success) {
        setWishlist(response.data?.items || []);
        setSuccessMessage('Product moved from wishlist to cart.');
      }
    } catch (err) {
      setError(err.message || 'Failed to move item to cart');
    }
  };

  const handleRemoveWishlistItem = async (productId) => {
    try {
      const response = await wishlistAPI.removeItem(productId);
      if (response.success) {
        setWishlist(response.data?.items || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove wishlist item');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Personal information, account overview, orders, and wishlist.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {displayUser ? (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Name</p>
                    <p className="text-lg font-semibold">
                      {displayUser.name || 'Not set'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="text-lg font-semibold">
                      {displayUser.email || displayUser._id}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Account Type</p>
                    <p className="text-lg font-semibold capitalize">
                      {displayUser.accountType || 'customer'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-700 uppercase">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {accountOverview?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-xs text-indigo-700 uppercase">
                      Wishlist
                    </p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {accountOverview?.wishlistCount || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-xs text-amber-700 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {accountOverview?.pendingOrders || 0}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-xs text-emerald-700 uppercase">
                      Delivered
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {accountOverview?.deliveredOrders || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Account Health</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {accountOverview?.accountHealth || 'Good'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {quickLinks.map((linkItem) => (
                    <Link
                      key={linkItem.path}
                      to={linkItem.path}
                      className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {linkItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              {orders.length === 0 ? (
                <p className="text-gray-600">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm mt-1">
                          Total:{' '}
                          <span className="font-semibold">
                            ${order.total?.toFixed?.(2) || order.total}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>

                        <button
                          onClick={() => handleReorder(order._id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-black"
                        >
                          Reorder
                        </button>

                        <span className="text-xs text-gray-500">
                          Track: {order.trackingNumber || 'Not available'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">
                Wishlist / Save for Later
              </h2>
              {wishlist.length === 0 ? (
                <p className="text-gray-600">Wishlist is empty.</p>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((item) => (
                    <div
                      key={item.productId}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded object-cover border border-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                          <p className="text-sm font-semibold text-gray-800">
                            ${item.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleMoveWishlistToCart(item.productId)
                          }
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveWishlistItem(item.productId)
                          }
                          className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <p className="text-center text-gray-600">No user data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
