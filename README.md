# UPAHAR TIFFINS AND FAST FOOD

A modern, production-grade, highly responsive full-stack restaurant platform built specifically for **UPAHAR TIFFINS AND FAST FOOD**. Featuring an authentic Indian culinary aesthetic, digital menu browsing, interactive shopping cart, order checkout, real-time visual order tracking, WhatsApp integration, and a comprehensive protected Admin Dashboard.

---

## 🌟 Visual Identity & Brand Highlights

- **Vibrant Food Palette**: Warm saffron (`#f97316`), deep chili red (`#dc2626`), golden amber (`#f59e0b`), warm off-white cream background, rich charcoal typography, and crisp leaf green badges for 100% Pure Veg items.
- **Dynamic Live Store Status**: Real-time calculation of restaurant operating hours (`06:30 AM – 11:00 PM IST`), displaying live `● OPEN NOW` or `○ CLOSED` badges with automated ordering guards.
- **Mobile-First Experience**: Optimized touch targets, mobile bottom navigation bar, smooth slide-over cart drawer, and instant WhatsApp ordering.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Micro-animations**: [Lucide React](https://lucide.dev/), CSS keyframes, Canvas Confetti
- **Backend & APIs**: Next.js Server Components, Route Handlers, Zod schema validation
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (local zero-dependency out-of-the-box execution), easily switchable to PostgreSQL (Neon, Supabase, Railway)
- **Authentication**: Secure bcrypt password hashing with HTTP-only JWT session cookies for the Admin Dashboard
- **Payment Architecture**: Dual-mode payment gateway layer (Cash on Delivery/Pickup, Direct UPI QR, and Razorpay test simulation & server-side HMAC signature verification)

---

## 📂 Project Architecture

```
UPAHAR/
├── prisma/
│   ├── schema.prisma              # Database schema (AdminUser, Category, FoodItem, Order, OrderItem, Offer, RestaurantSetting, GalleryImage, ContactMessage)
│   └── seed.ts                    # Authentic South Indian tiffins & fast food seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with CartProvider, Toast, Navbar, Footer, JSON-LD SEO schema
│   │   ├── page.tsx               # Homepage (Hero, Open/Closed status, Bestsellers, Categories, Offers, Why Us, Gallery, Reviews, Location)
│   │   ├── menu/page.tsx          # Full digital menu with live search, category pills, veg/spicy filters, sorting
│   │   ├── menu/[id]/page.tsx     # Individual dish details, ingredients, prep time, portion size, related items
│   │   ├── offers/page.tsx        # Active promotional deals, coupon codes with 1-click copy
│   │   ├── about/page.tsx         # Heritage, four quality pillars, stone-ground batter pledge
│   │   ├── gallery/page.tsx       # Photo gallery with category filter and zoom lightbox
│   │   ├── contact/page.tsx       # Address, operating hours, phone, WhatsApp link, validated feedback form
│   │   ├── cart/page.tsx          # Itemized cart review with taxes, free delivery bar, coupon applicator
│   │   ├── checkout/page.tsx      # Doorstep Delivery vs Pickup, address form, payment options, store hour checks
│   │   ├── order-confirmation/[id]/page.tsx # Invoice receipt, confetti celebration, WhatsApp updates
│   │   ├── order-tracking/page.tsx# Lookup order by Order # or Mobile Phone #
│   │   ├── order-tracking/[id]/page.tsx # Live auto-refreshing visual order timeline
│   │   ├── privacy/page.tsx       # Privacy policy
│   │   ├── terms/page.tsx         # Terms of service and refund policy
│   │   ├── sitemap.ts             # Dynamic SEO sitemap
│   │   ├── robots.ts              # Robots.txt
│   │   ├── admin/
│   │   │   ├── login/page.tsx     # Admin authentication login
│   │   │   ├── page.tsx           # Metrics overview, today's sales, active orders queue, store pause toggle
│   │   │   ├── orders/page.tsx    # Live order queue, status updater, KOT kitchen ticket print
│   │   │   ├── menu/page.tsx      # Full CRUD for dishes, price edit, instant in-stock / out-of-stock toggle
│   │   │   ├── categories/page.tsx# Manage menu categories and display order
│   │   │   ├── offers/page.tsx    # Promo coupon code creator
│   │   │   ├── gallery/page.tsx   # Photo showcase manager
│   │   │   └── settings/page.tsx  # Restaurant hours, phone, WhatsApp, delivery fee, tax percentage
│   │   └── api/
│   │       ├── auth/              # Admin login, logout, session verification
│   │       ├── menu/              # Menu dishes & individual item CRUD
│   │       ├── categories/        # Category listing & creation
│   │       ├── orders/            # Order placement, lookup, and status update
│   │       ├── offers/            # Offers listing & coupon verification
│   │       ├── restaurant/        # Business settings & live store status computation
│   │       ├── gallery/           # Photo gallery management
│   │       ├── contact/           # Customer feedback storage
│   │       └── payments/razorpay/ # Razorpay order creation & HMAC verification
│   ├── components/
│   │   ├── layout/Navbar.tsx      # Sticky glassmorphism header, cart counter, mobile drawer, mobile bottom bar
│   │   ├── layout/Footer.tsx      # Complete restaurant footer with timings, map link, FSSAI / pure veg pledge
│   │   ├── layout/WhatsAppButton.tsx # Floating WhatsApp order & support button
│   │   ├── menu/FoodCard.tsx      # Dish card with veg badge, bestseller badge, spicy indicator, quantity controls
│   │   ├── cart/CartDrawer.tsx    # Slide-over cart preview with free delivery progress bar
│   │   ├── order/OrderTimeline.tsx# Multi-step visual progress bar
│   │   └── admin/AdminSidebar.tsx # Admin dashboard sidebar
│   ├── context/CartContext.tsx    # LocalStorage-persisted cart state, discount & tax calculations
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # Admin JWT verification & HTTP-only cookies
│   │   ├── store-hours.ts         # Real-time store open/closed calculator
│   │   └── utils.ts               # Indian currency formatter (₹), date helpers
│   └── types/index.ts             # TypeScript definitions
├── .env.example
├── package.json
└── test-endpoints.mjs             # Automated test suite
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested with v22.14.0)
- **npm** v9+ (tested with v10.9.2)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database & Seed Initial Menu
```bash
# Push schema to SQLite database (dev.db)
npm run db:push

# Seed database with authentic South Indian tiffins, dosas, snacks, and admin user
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Portal Credentials

- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: `admin@upahar.com`
- **Password**: `admin123`

---

## 🧪 Automated Testing

Run the automated endpoint & order-flow test suite:
```bash
npm test
```

This verifies:
- All 14 public and API routes respond with HTTP 200 OK
- End-to-end order placement via `POST /api/orders`
- Real-time order retrieval via `GET /api/orders/[id]`

---

## ⚙️ Environment Variables

Create or edit your `.env` file:

```env
# Database URL (SQLite for local, PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# Admin Authentication
JWT_SECRET="your_secure_random_jwt_secret_key"
ADMIN_EMAIL="admin@upahar.com"
ADMIN_PASSWORD="admin123"

# Public Brand Information
NEXT_PUBLIC_RESTAURANT_NAME="UPAHAR TIFFINS AND FAST FOOD"
NEXT_PUBLIC_RESTAURANT_TAGLINE="Fresh Tiffins. Delicious Fast Food. Made for Every Craving."
NEXT_PUBLIC_RESTAURANT_PHONE="+91 98765 43210"
NEXT_PUBLIC_RESTAURANT_WHATSAPP="919876543210"
NEXT_PUBLIC_CURRENCY="₹"

# Payment Gateway (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder_upahar"
RAZORPAY_KEY_SECRET="placeholder_secret_upahar"
```

---

## 🌐 Production Deployment Guide

### Deploying to Vercel + Neon / Supabase PostgreSQL

1. **Database**:
   - Create a PostgreSQL database on [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
   - Update `DATABASE_URL` in your production environment variables to your PostgreSQL connection string.

2. **Vercel**:
   - Push your code to GitHub.
   - Import project into [Vercel](https://vercel.com).
   - Add the environment variables from `.env`.
   - Build Command: `prisma generate && prisma db push && next build`.
   - Deploy!

---

## 📄 License & Copyright

© 2026 UPAHAR TIFFINS AND FAST FOOD. All rights reserved.
