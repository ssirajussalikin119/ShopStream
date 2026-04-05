# ShopStream — Complete E-Commerce Platform

A full-stack e-commerce web app built with React (Vite + Tailwind) on the frontend and Node.js / Express / MongoDB on the backend.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=5000
```

### 3. Run the App

```bash
# Terminal 1 — Start server (auto-seeds products & deals)
cd server
npm run dev

# Terminal 2 — Start client
cd client
npm run dev
```

Open **http://localhost:5173**

---

## 📦 What's Included

### Pages
| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Home (Hero, Categories, Featured, Newsletter, Footer) | No |
| `/category/:slug` | Category with filters, sort, search | No |
| `/product/:id` | Product Detail with related products | No |
| `/search?q=` | Search Results | No |
| `/deals` | Deals & Promo Codes | No |
| `/favourites` | Saved Products | No |
| `/cart` | Cart with promo code + checkout | No (checkout requires login) |
| `/contact` | Contact Form | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/profile` | User Profile | ✅ Yes |
| `/orders` | Order History | ✅ Yes |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products` | All products (filterable) |
| GET | `/api/products/:id` | Single product + related |
| GET | `/api/cart` | Get cart (auth) |
| POST | `/api/cart/items` | Add item (auth) |
| PATCH | `/api/cart/items/:id` | Update quantity (auth) |
| DELETE | `/api/cart/items/:id` | Remove item (auth) |
| DELETE | `/api/cart` | Clear cart (auth) |
| GET | `/api/offers` | All active deals |
| GET | `/api/offers/validate/:code` | Validate promo code |
| POST | `/api/orders/checkout` | Place order (auth) |
| GET | `/api/orders` | Order history (auth) |
| GET | `/api/orders/:orderId` | Single order (auth) |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |

### Features
- 🛒 **Cart** — add, update, remove, clear. Persists per user in MongoDB.
- 🏷️ **Deals** — 6 seeded promo codes. Validate + apply at checkout. Shows discount type (% or fixed), expiry, min order.
- 📦 **Orders** — real order records saved to DB with status, tax, discount tracking.
- 📋 **Order History** — expandable order cards with all item details and totals.
- ❤️ **Favourites** — stored in localStorage, synced across tabs.
- 🔍 **Search** — client-side filtering from full product list.
- 🗂️ **Category Filters** — brand, subcategory, price range, sort.
- 📧 **Newsletter** — email subscription stored in MongoDB.
- 👤 **Auth** — JWT auth, role-based (user/seller/admin), bcrypt hashing.
- 📱 **Responsive** — mobile drawer nav, responsive grid layouts.

### Seeded Data
- **Products** — auto-seeded from `server/src/data/seedProducts.js`
- **Deals** — 6 promo codes auto-seeded:
  - `WELCOME15` — 15% off any order
  - `ELEC30` — $30 off electronics $150+
  - `READ20` — 20% off ebooks
  - `DEVTOOLS25` — 25% off software $50+
  - `ACC10` — $10 off accessories $60+
  - `MEGA50` — $50 off $100+ (expires in 7 days)

---

## 🛠️ Tech Stack

**Frontend:** React 19, React Router v7, Tailwind CSS v4, Axios, Lucide React  
**Backend:** Node.js, Express v5, MongoDB, Mongoose, JWT, bcryptjs, express-validator
