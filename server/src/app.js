require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const offerRoutes = require("./routes/offerRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const aiRoutes = require("./routes/aiRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const profileRoutes = require("./routes/profileRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");

const app = express();

const envOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...envOrigins,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ]),
);

const normalizeOrigin = (origin = "") =>
  origin.trim().replace(/\/$/, "").toLowerCase();

const isSslCommerzOrigin = (origin = "") =>
  /^https?:\/\/([a-z0-9-]+\.)?sslcommerz\.com$/i.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and same-origin requests without an Origin header.
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);
      const normalizedAllowList = allowedOrigins.map(normalizeOrigin);

      if (normalizedAllowList.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      if (isSslCommerzOrigin(normalizedOrigin)) {
        return callback(null, true);
      }

      // Do not throw for unknown origins; omit CORS headers instead.
      // Throwing here returns 500 and breaks external payment callbacks.
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) =>
  res.json({ message: "ShopStream API is running..." }),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes); // Cart checkout + order history (old)
app.use("/api/orders", ordersRoutes); // Reorder (new controller)
app.use("/api/offers", offerRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/payment", paymentRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
