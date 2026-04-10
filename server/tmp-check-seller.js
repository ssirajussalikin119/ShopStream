require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const seller = await User.findOne({ email: 'hadiscarvect@gmail.com' }).lean();
  console.log('SELLER', seller ? { id: seller._id.toString(), email: seller.email, role: seller.role } : null);
  const products = await Product.find({ sellerId: seller._id }, { name: 1, status: 1, categorySlug: 1, categoryName: 1, sellerId: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();
  console.log('SELLER_PRODUCTS', products.map(p => ({ name: p.name, status: p.status, categorySlug: p.categorySlug, categoryName: p.categoryName })));
  const publicMatches = await Product.find({ categorySlug: 'software-tools', $or: [{ status: 'published' }, { status: null }, { status: { $exists: false } }] }, { name: 1, status: 1, categorySlug: 1, categoryName: 1, sellerId: 1 }).lean();
  console.log('SOFTWARE_TOOLS_PUBLIC_MATCHES', publicMatches.map(p => ({ name: p.name, status: p.status, categorySlug: p.categorySlug, categoryName: p.categoryName, sellerId: String(p.sellerId || '') })));
  await mongoose.disconnect();
})().catch(async (err) => { console.error(err); try { await mongoose.disconnect(); } catch {} process.exit(1); });
