const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const profileRoutes = require('./routes/profileRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');

const app = express();

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ShopStream API is running...' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/seller', sellerRoutes);

// Error handling - must be last
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
