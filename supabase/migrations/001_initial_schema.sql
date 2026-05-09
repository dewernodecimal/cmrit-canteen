-- ============================================================
-- CMRIT Canteen — Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (Guest-based, keyed by phone number)
CREATE TABLE IF NOT EXISTS profiles (
  phone        TEXT PRIMARY KEY CHECK (phone ~ '^\d{10}$'),
  display_name TEXT,
  credit_balance INTEGER NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MENU ITEMS (with daily stock cap)
DO $$ BEGIN
  CREATE TYPE item_category AS ENUM ('snacks', 'meals', 'beverages', 'desserts');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  price           INTEGER NOT NULL CHECK (price > 0),
  category        item_category NOT NULL DEFAULT 'snacks',
  image_url       TEXT,
  daily_stock_cap INTEGER NOT NULL DEFAULT 100,
  current_stock   INTEGER NOT NULL DEFAULT 100,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ORDERS
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending_payment', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone             TEXT NOT NULL REFERENCES profiles(phone),
  collection_code   CHAR(4),
  status            order_status NOT NULL DEFAULT 'pending_payment',
  total_amount      INTEGER NOT NULL CHECK (total_amount >= 0),
  credits_used      INTEGER NOT NULL DEFAULT 0,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- 4. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   INTEGER NOT NULL CHECK (unit_price > 0),
  item_name    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 5. TRANSACTIONS (audit log)
DO $$ BEGIN
  CREATE TYPE txn_type AS ENUM ('credit_issued', 'credit_redeemed', 'payment_captured', 'refund');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT NOT NULL REFERENCES profiles(phone),
  order_id   UUID REFERENCES orders(id),
  type       txn_type NOT NULL,
  amount     INTEGER NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_phone ON transactions(phone);


-- ============================================================
-- RPC: Atomically process a confirmed payment
-- ============================================================
CREATE OR REPLACE FUNCTION process_confirmed_payment(
  p_order_id UUID,
  p_razorpay_payment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order RECORD;
  v_item  RECORD;
  v_collection_code CHAR(4);
BEGIN
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id AND status = 'pending_payment'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found or already processed');
  END IF;

  FOR v_item IN
    SELECT oi.menu_item_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    UPDATE menu_items
    SET current_stock = current_stock - v_item.quantity,
        updated_at = now()
    WHERE id = v_item.menu_item_id
      AND current_stock >= v_item.quantity;

    IF NOT FOUND THEN
      UPDATE orders
      SET status = 'cancelled',
          razorpay_payment_id = p_razorpay_payment_id,
          updated_at = now()
      WHERE id = p_order_id;

      UPDATE profiles
      SET credit_balance = credit_balance + v_order.total_amount,
          updated_at = now()
      WHERE phone = v_order.phone;

      INSERT INTO transactions (phone, order_id, type, amount, note)
      VALUES (
        v_order.phone, p_order_id, 'credit_issued',
        v_order.total_amount,
        'Auto-credit: stock depleted after payment'
      );

      RETURN jsonb_build_object(
        'success', false,
        'error', 'Stock depleted — credit issued',
        'credited', v_order.total_amount
      );
    END IF;
  END LOOP;

  v_collection_code := lpad(floor(random() * 10000)::text, 4, '0');

  UPDATE orders
  SET status = 'confirmed',
      collection_code = v_collection_code,
      razorpay_payment_id = p_razorpay_payment_id,
      updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO transactions (phone, order_id, type, amount)
  VALUES (v_order.phone, p_order_id, 'payment_captured', v_order.total_amount);

  RETURN jsonb_build_object(
    'success', true,
    'collection_code', v_collection_code
  );
END;
$$;


-- ============================================================
-- RPC: Increment credits (for staff cancel)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_credits(p_phone TEXT, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET credit_balance = credit_balance + p_amount,
      updated_at = now()
  WHERE phone = p_phone;
END;
$$;


-- ============================================================
-- RPC: Process credit-only payment
-- ============================================================
CREATE OR REPLACE FUNCTION process_credit_payment(
  p_order_id UUID,
  p_phone TEXT,
  p_credits INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Decrement stock for each item
  FOR v_item IN
    SELECT oi.menu_item_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    UPDATE menu_items
    SET current_stock = current_stock - v_item.quantity,
        updated_at = now()
    WHERE id = v_item.menu_item_id
      AND current_stock >= v_item.quantity;
  END LOOP;

  -- Deduct credits
  UPDATE profiles
  SET credit_balance = credit_balance - p_credits,
      updated_at = now()
  WHERE phone = p_phone;

  -- Log transaction
  INSERT INTO transactions (phone, order_id, type, amount, note)
  VALUES (p_phone, p_order_id, 'credit_redeemed', p_credits, 'Credits used at checkout');
END;
$$;


-- ============================================================
-- RPC: Reset daily stock
-- ============================================================
CREATE OR REPLACE FUNCTION reset_daily_stock()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE menu_items
  SET current_stock = daily_stock_cap,
      is_available = true,
      updated_at = now();
END;
$$;


-- ============================================================
-- Enable Realtime for orders and menu_items
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read for menu items
CREATE POLICY "Public can view menu" ON menu_items
  FOR SELECT USING (true);

-- Public read for orders (by phone, via service role for staff)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (true);

-- Service role has full access (webhook, staff API)
-- The service role key automatically bypasses RLS


-- ============================================================
-- SEED DATA: Sample menu items
-- ============================================================
INSERT INTO menu_items (name, description, price, category, daily_stock_cap, current_stock) VALUES
  ('Samosa',           'Crispy pastry filled with spiced potatoes and peas',  1500,  'snacks',    100, 100),
  ('Vada Pav',         'Mumbai-style spiced potato fritter in a bun',         2000,  'snacks',    80,  80),
  ('Pani Puri',        'Crispy puris with tangy tamarind water (6 pcs)',      3000,  'snacks',    60,  60),
  ('Masala Dosa',      'Crispy rice crepe with potato filling & chutneys',    5000,  'meals',     50,  50),
  ('Veg Biryani',      'Fragrant basmati rice with mixed vegetables',         8000,  'meals',     40,  40),
  ('Paneer Butter Masala', 'Rich tomato-cream curry with paneer cubes',       9000,  'meals',     35,  35),
  ('Chole Bhature',    'Spicy chickpea curry with fluffy fried bread',        7000,  'meals',     45,  45),
  ('Veg Thali',        'Complete meal: dal, sabzi, rice, roti, salad',       10000,  'meals',     30,  30),
  ('Masala Chai',      'Spiced Indian tea with milk',                         1500,  'beverages', 150, 150),
  ('Cold Coffee',      'Chilled coffee blended with ice cream',              4000,  'beverages', 60,  60),
  ('Fresh Lime Soda',  'Refreshing lime with soda, sweet or salted',         2500,  'beverages', 80,  80),
  ('Mango Lassi',      'Thick mango yogurt drink',                           3500,  'beverages', 50,  50),
  ('Gulab Jamun',      'Soft milk dumplings in rose-cardamom syrup (2 pcs)', 3000,  'desserts',  40,  40),
  ('Rasgulla',         'Soft cottage cheese balls in sugar syrup (2 pcs)',    2500,  'desserts',  40,  40),
  ('Jalebi',           'Crispy spirals soaked in saffron sugar syrup',        2000,  'desserts',  50,  50);
