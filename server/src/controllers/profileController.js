const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// GET /api/profile/dashboard - return profile and dashboard summary
const getDashboard = asyncHandler(async (req, res) => {
  const [recentOrders, statusSummary, wishlist] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber status total createdAt trackingNumber')
      .lean(),
    Order.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Wishlist.findOne({ user: req.user._id }).lean(),
  ]);

  const counts = {
    pending: 0,
    shipped: 0,
    delivered: 0,
  };

  for (const row of statusSummary) {
    if (counts[row._id] !== undefined) {
      counts[row._id] = row.count;
    }
  }

  const totalOrders = counts.pending + counts.shipped + counts.delivered;
  const accountHealth = req.user.isActive ? 'Good' : 'Attention needed';

  return sendResponse(
    res,
    200,
    true,
    'Profile dashboard fetched successfully',
    {
      personalInformation: {
        name: req.user.name,
        email: req.user.email,
      },
      accountOverview: {
        accountHealth,
        totalOrders,
        pendingOrders: counts.pending,
        shippedOrders: counts.shipped,
        deliveredOrders: counts.delivered,
        wishlistCount: wishlist?.items?.length || 0,
      },
      recentOrders,
      quickLinks: [
        { label: 'Go to cart', path: '/cart' },
        { label: 'Browse electronics', path: '/category/electronics' },
        { label: 'Contact support', path: '/contact' },
      ],
    }
  );
});

module.exports = { getDashboard };
