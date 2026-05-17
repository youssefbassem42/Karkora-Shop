# KarKora Shop 🌸

> A full-stack, production-ready e-commerce platform for women's accessories and makeup.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Context API, Axios, React Router v6 |
| **Styling** | Vanilla CSS with design tokens + dark mode |
| **Backend** | Node.js + Express.js (MVC) |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (admin only) |
| **Notifications** | Telegram Bot API |

---

## 📁 Project Structure

```
KarKora-Shop/
├── client/          ← React + Vite frontend
│   └── src/
│       ├── components/     # Navbar, Footer, ProductCard
│       ├── pages/          # Home, Shop, ProductDetail, Cart, Checkout
│       │   └── admin/      # AdminLogin, AdminDashboard, AdminProducts, AdminOrders
│       ├── context/        # Cart, Auth, Theme, Toast providers
│       ├── services/api.js # Axios API service
│       └── index.css       # Design system tokens
│
└── server/          ← Node.js + Express backend
    └── src/
        ├── controllers/    # authController, productController, orderController
        ├── models/         # Product.js, Order.js
        ├── routes/         # authRoutes, productRoutes, orderRoutes
        ├── middleware/      # authMiddleware (JWT), errorMiddleware
        ├── services/       # telegramService
        └── config/db.js    # MongoDB connection
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the repo
```bash
git clone https://github.com/you/karkora-shop.git
cd karkora-shop
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Telegram credentials
npm install
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```

### 4. Run in development
From the root directory:
```bash
npm install        # installs concurrently
npm run dev        # starts both client (5173) and server (5000)
```

Or individually:
```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

---

## ⚙️ Environment Variables (server/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/karkora_shop
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
TELEGRAM_BOT_TOKEN=your_bot_token    # optional
TELEGRAM_CHAT_ID=your_chat_id        # optional
CLIENT_URL=http://localhost:5173
```

---

## 🔑 Admin Access

1. Navigate to `http://localhost:5173/admin/login`
2. Login with:
   - **Username**: `admin` (configurable via `.env`)
   - **Password**: `admin123` (configurable via `.env`)

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login → JWT |
| GET | `/api/auth/verify` | Admin | Verify token |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | Get active products (filters: category, search, page) |
| GET | `/api/products/all` | Admin | Get all products incl. inactive |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| PATCH | `/api/products/:id/status` | Admin | Toggle active/inactive |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | — | Place new order |
| GET | `/api/orders` | Admin | List all orders |
| GET | `/api/orders/stats` | Admin | Dashboard stats |
| GET | `/api/orders/:id` | Admin | Single order |
| PATCH | `/api/orders/:id/status` | Admin | Update status |

---

## 🤖 Telegram Notifications

When a new order is placed, the backend sends a formatted message to your Telegram bot:

```
🛒 New Order — KarKora Shop

👤 Name: Sara Ahmed
📞 Phone: 010XXXXXXX
📍 Address: 123 Cairo Street

🧾 Items:
  • Lipstick (x2) — 700 EGP
  • Bracelet (x1) — 150 EGP

🖼️ Product Images:
  • [Lipstick](image_url)

💰 Total: 850 EGP
📋 Order ID: `abc123...`
```

Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `server/.env`.

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Push dist/ to Vercel or connect GitHub repo
```
Set `VITE_API_URL=https://your-backend.render.com/api` in Vercel env vars.

### Backend → Render
- Connect your GitHub repo
- Build command: `cd server && npm install`
- Start command: `node server/server.js`
- Set all env vars from `server/.env` in Render dashboard

### Database → MongoDB Atlas
- Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
- Copy the connection URI to `MONGODB_URI` env var

---

## ✨ Features

- 🏠 **Home** — Hero, category cards, trending products, feature banners
- 🛍️ **Shop** — Category/search filtering, pagination
- 📄 **Product Detail** — Gallery, add to cart, trust signals
- 🛒 **Cart** — Quantity control, localStorage persistence
- 💳 **Checkout** — Form validation, order submission
- 🌙 **Dark Mode** — Persistent via localStorage
- 📱 **Mobile First** — Fully responsive
- 🔐 **Admin Panel** — JWT-protected dashboard, product CRUD, order management
- 📲 **Telegram Bot** — Instant order notifications
