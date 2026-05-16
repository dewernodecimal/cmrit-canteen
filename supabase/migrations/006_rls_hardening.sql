-- Migration 006: RLS hardening
-- Tighten the "view own orders" policy so direct DB access
-- can't read other users' orders (service role bypasses this anyway)

-- Drop the overly-permissive policy
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

-- Re-add them in a way that makes intent clear
-- (Service role already bypasses RLS, so staff API is unaffected)
-- Anon/public users cannot read orders at all via direct DB
CREATE POLICY "No direct public order access" ON orders
  FOR SELECT USING (false);

CREATE POLICY "No direct public order_items access" ON order_items
  FOR SELECT USING (false);
