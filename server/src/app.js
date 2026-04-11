const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const offerRoutes = require('./routes/offerRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const profileRoutes = require('./routes/profileRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.json({ message: 'ShopStream API is running...' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);      // Cart checkout + order history (old)
app.use('/api/orders', ordersRoutes);     // Reorder (new controller)
app.use('/api/offers', offerRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/seller', sellerRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
