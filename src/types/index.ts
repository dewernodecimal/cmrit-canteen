// ============================================================
// CMRIT Canteen — Shared Type Definitions
// ============================================================

export type ItemCategory = 'snacks' | 'meals' | 'beverages' | 'desserts';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type TransactionType =
  | 'credit_issued'
  | 'credit_redeemed'
  | 'payment_captured'
  | 'refund';

// ============================================================
// Database Row Types
// ============================================================

export interface Profile {
  phone: string;
  display_name: string | null;
  credit_balance: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number; // in paise
  category: ItemCategory;
  image_url: string | null;
  daily_stock_cap: number;
  current_stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  phone: string;
  collection_code: string | null;
  status: OrderStatus;
  total_amount: number; // in paise
  credits_used: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number; // paise
  item_name: string;
}

export interface Transaction {
  id: string;
  phone: string;
  order_id: string | null;
  type: TransactionType;
  amount: number; // paise
  note: string | null;
  created_at: string;
}

// ============================================================
// Client-side Cart Types
// ============================================================

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number; // paise
}

// ============================================================
// API Types
// ============================================================

export interface CreateOrderPayload {
  phone: string;
  items: { menu_item_id: string; quantity: number }[];
  use_credits: boolean;
}

export interface CreateOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  amount_to_pay: number; // paise (after credits)
  credits_applied: number;
  key_id: string;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_item?: MenuItem })[];
}
