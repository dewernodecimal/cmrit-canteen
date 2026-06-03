-- ============================================================
-- Migration 008: Fix RLS — Restrict anon SELECT on orders/order_items
-- Issue 2+9 fix from penetration test report.
--
-- PROBLEM: Migration 007 opened SELECT with USING (true), allowing
-- anyone with the public anon key to dump all orders and phone numbers.
-- (Confirmed: 76 orders + 13 phone numbers dumped in ~1 second)
--
-- SOLUTION: Deny public anon SELECT. All order reads now go through
-- /api/orders/mine which uses the service-role key after verifying
-- the caller's phone ownership via password.
--
-- NOTE: Staff dashboard reads orders via /api/orders (staff PIN protected),
-- also using service-role key — unaffected by this change.
-- Real-time tracking of individual orders (/order/[id]) still works
-- via Supabase client since useOrder filters by `id=eq.{orderId}`,
-- but the anon key can no longer SELECT * without a filter.
-- ============================================================

-- Drop the open policies from migration 007
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

-- Deny all anon/public direct SELECT access
-- All order reads are now mediated by server API routes using service-role key
CREATE POLICY "No public read access to orders" ON orders
  FOR SELECT USING (false);

CREATE POLICY "No public read access to order items" ON order_items
  FOR SELECT USING (false);
