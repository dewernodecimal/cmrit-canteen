// ============================================================
// CMRIT Canteen — App Constants
// ============================================================

export const APP_NAME = 'CMRIT Bites';

export const APP_DESCRIPTION = 'Skip the queue. Order from your phone. Pick up when ready.';

// High demand threshold — if ≥ this many pending/in-progress orders exist for an item, show warning
export const HIGH_DEMAND_THRESHOLD = 10;

// Session storage keys
export const STORAGE_KEYS = {
  PHONE: 'cmrit_phone',
  CART: 'cmrit_cart',
} as const;

// Order status display config
export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  pending_payment: {
    label: 'Awaiting Payment',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  awaiting_verification: {
    label: 'Verifying UTR...',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  confirmed: {
    label: 'Order Confirmed',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
  },
  in_progress: {
    label: 'Being Prepared',
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
  },
  ready: {
    label: 'Ready for Pickup!',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  completed: {
    label: 'Collected',
    color: 'text-zinc-600',
    bgColor: 'bg-surface-700',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
  },
};


// Category display config
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; emoji: string }
> = {
  all:               { label: 'All',               emoji: '🍽️' },
  sandwiches:        { label: 'Sandwiches',         emoji: '🥪' },
  burgers:           { label: 'Burgers',            emoji: '🍔' },
  maggi:             { label: 'Maggi',              emoji: '🍜' },
  milkshakes:        { label: 'Milkshakes & Drinks', emoji: '🥤' },
  snacks_refreshers: { label: 'Snacks & Refreshers', emoji: '🍟' },
  juices:            { label: 'Juices',             emoji: '🧃' },
  fruits:            { label: 'Fruits',             emoji: '�' },
  meals:             { label: 'Meals',              emoji: '🍛' },
  snacks:            { label: 'Snacks',             emoji: '🍿' },
  beverages:         { label: 'Beverages',          emoji: '☕' },
  desserts:          { label: 'Desserts',           emoji: '🍰' },
};

// Format paise to rupees display string
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

// Generate a random 4-digit collection code
export function generateCollectionCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
