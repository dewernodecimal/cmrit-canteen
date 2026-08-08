# 🍽️ CMRIT Canteen: Unified Digital Ordering & Wallet System

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CMRIT Canteen** is a high-performance web application designed to eliminate lunch queues and streamline food service at CMR Institute of Technology. Students can pre-order meals directly from classrooms prior to peak rush hours using an in-app credit wallet system, enabling instant order fulfillment and automated ledger tracking.

---

## 🌟 Key Features

* **Pre-Ordering for Peak Hour Elimination**: Allows students to order ahead from classrooms, selecting pick-up time slots to avoid canteen queues.
* **In-App Digital Wallet**: Seamless credit-based ordering system that bypasses manual payment verification and transaction delays.
* **Real-Time Order Tracking**: Status pipeline (Placed ➔ In Preparation ➔ Ready for Pickup ➔ Fulfilled) powered by Supabase real-time subscriptions.
* **Canteen Staff Management Dashboard**: Real-time kitchen display unit (KDU) for canteen staff to update item availability and manage order queues.
* **Transactional Security**: PostgreSQL RPC functions ensuring strict transactional balance checks and zero double-spend anomalies.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Student Mobile/Web UI] --> B[Next.js App Router Frontend]
    C[Canteen Staff Dashboard] --> B
    B --> D[Supabase Realtime Engine]
    D --> E[PostgreSQL Database]
    E --> F[Atomic Credit Wallet RPCs]
    D --> G[Order Status Broadcast Channel]
```

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
* **Language**: TypeScript
* **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime Subscriptions)
* **Styling**: Tailwind CSS
* **Icons & Components**: Lucide React, Shadcn UI primitives

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.0 or higher
* npm or pnpm

### Setup & Local Development
```bash
# Clone repository
git clone https://github.com/dewernodecimal/cmrit-canteen.git
cd cmrit-canteen

# Install dependencies
npm install

# Configure environment variables (.env.local)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev
```
Navigate to `http://localhost:3000` to access the application.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
