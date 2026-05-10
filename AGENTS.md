# 🤖 CMRIT Canteen — Agent Instructions

This repository uses custom architecture for its credit-based payment system. Please follow these rules strictly:

### 1. Atomic Payments
**NEVER** deduct credits or decrement stock using simple client-side logic. You **MUST** use the `process_credit_payment` RPC function in Supabase. It handles locking and validation to prevent race conditions (e.g., two students buying the last samosa).

### 2. Credit Currency
All monetary values in the database are stored in **Paise** (integers) to avoid floating-point rounding errors. 
- ₹15.00 = 1500
- Always use the `formatPrice` utility for display.

### 3. Authentication
We use a custom phone + hashed password auth (SHA-256). Do not attempt to use Supabase Auth hooks (`useUser`, etc.) as they are not currently configured for the student profiles.

### 4. Theme System
Theme state is managed via `ThemeContext`. CSS variables are defined in `globals.css` under `:root` and `.light-theme`. Always use these variables instead of hardcoded colors.

### 5. Deployment
The app uses Next.js 15 App Router. Ensure all new routes are SSR-safe. See `ThemeContext.tsx` for how we handle hydration mismatch.
