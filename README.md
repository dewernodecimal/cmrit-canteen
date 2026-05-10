# 🍽️ CMRIT Canteen — Skip the Queue

A modern, high-performance, credit-based ordering system for the CMRIT Canteen. Designed to eliminate long queues and automate payment verification using an in-app wallet system.

![App Screenshot](https://img.shields.io/badge/Status-Live-emerald)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2015%20|%20Supabase%20|%20Tailwind-orange)

## 🌟 Key Features

### 🛒 Seamless Ordering
- **Pure Credit System:** No manual UTR verification. Students top up their wallet at the canteen counter and order instantly.
- **Smart Cart:** Persistent local storage, quantity management, and "Optimistic UI" for instant feedback.
- **Collection Codes:** Every order generates a secure 4-digit code for quick pick-up.

### 🔐 Secure Authentication
- **Password Protection:** Phone-based login with hashed passwords (SHA-256) to prevent unauthorized credit usage.
- **Staff Control:** Dedicated staff dashboard for inventory management, stock resets, and wallet top-ups.

### 🎨 Premium Experience
- **🌗 Theme Toggle:** Smooth transitions between deep dark mode and clean light mode.
- **🚀 Performance:** Skeleton loaders, edge caching (1-min revalidation), and atomic database transactions.
- **📱 Mobile First:** Fully responsive glassmorphism UI designed for student smartphones.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Edge Functions, RPC)
- **Icons:** Lucide React
- **Persistence:** LocalStorage & Supabase Realtime

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/dewernodecimal/CMRIT-Canteen.git
cd cmrit-canteen
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STAFF_PIN=your_4_digit_pin
```

### 3. Database Setup
Run the SQL migrations found in `/supabase/migrations` in your Supabase SQL Editor:
1. `001_initial_schema.sql`
2. `003_auth_and_fixes.sql`

### 4. Run Locally
```bash
npm run dev
```

## 🛡️ Architecture Highlights

- **Atomic Payments:** Uses PostgreSQL functions (RPC) to ensure credits are only deducted if the item is in stock.
- **Error Boundaries:** Global error handling to prevent app crashes during network failures.
- **Persistence:** Cart and Theme state persist across browser sessions.

## 👨‍💻 Contributing

This project is built with love for the CMRIT community. Feel free to open issues or submit PRs!

---
© 2026 CMRIT Canteen Team
