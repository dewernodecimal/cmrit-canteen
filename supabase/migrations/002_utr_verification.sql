-- ============================================================
-- Migration: Add UTR verification flow
-- ============================================================

-- 1. Add 'awaiting_verification' to order_status ENUM
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'awaiting_verification' AFTER 'pending_payment';

-- 2. Add utr_number column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_number TEXT;

-- 3. Update the process_confirmed_payment RPC to work with UTRs instead of Razorpay
CREATE OR REPLACE FUNCTION process_confirmed_payment(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order RECORD;
  v_item  RECORD;
  v_collection_code CHAR(4);
BEGIN
  -- We now expect the order to be in 'awaiting_verification'
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id AND status = 'awaiting_verification'
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
      -- Out of stock! Cancel order and issue credits
      UPDATE orders
      SET status = 'cancelled',
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
        'Auto-credit: stock depleted before UTR verification'
      );

      RETURN jsonb_build_object(
        'success', false,
        'error', 'Stock depleted — credit issued',
        'credited', v_order.total_amount
      );
    END IF;
  END LOOP;

  IF v_order.utr_number IS NOT NULL THEN
    v_collection_code := right(v_order.utr_number, 4);
  ELSE
    v_collection_code := lpad(floor(random() * 10000)::text, 4, '0');
  END IF;

  UPDATE orders
  SET status = 'confirmed',
      collection_code = v_collection_code,
      updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO transactions (phone, order_id, type, amount, note)
  VALUES (v_order.phone, p_order_id, 'payment_captured', v_order.total_amount, 'UTR Verified');

  RETURN jsonb_build_object(
    'success', true,
    'collection_code', v_collection_code
  );
END;
$$;
