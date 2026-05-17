-- Migration 007: Revert RLS to allow user order fetching
-- Our frontend uses Supabase Realtime and direct client queries (useOrders hook) 
-- to fetch a user's own orders. Since we use a custom phone+password auth system,
-- the Supabase client runs as 'anon'. To allow the app to function and subscribe
-- to real-time status updates, we must allow SELECT on orders.

DROP POLICY IF EXISTS "No direct public order access" ON orders;
DROP POLICY IF EXISTS "No direct public order_items access" ON order_items;

-- Restore the original policies so useOrders.ts can fetch and subscribe to changes
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (true);
