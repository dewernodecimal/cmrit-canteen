// ============================================================
// CMRIT Canteen — App Constants
// ============================================================

export const APP_NAME = 'CMRIT Canteen';
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
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  awaiting_verification: {
    label: 'Verifying UTR...',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  confirmed: {
    label: 'Order Confirmed',
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
  },
  in_progress: {
    label: 'Being Prepared',
    color: 'text-brand-400',
    bgColor: 'bg-brand-400/10',
  },
  ready: {
    label: 'Ready for Pickup!',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  completed: {
    label: 'Collected',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-400/10',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
  },
};

// Category display config
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; emoji: string }
> = {
  all: { label: 'All', emoji: '🍽️' },
  snacks: { label: 'Snacks', emoji: '🍿' },
  meals: { label: 'Meals', emoji: '🍛' },
  beverages: { label: 'Beverages', emoji: '☕' },
  desserts: { label: 'Desserts', emoji: '🍰' },
};

// Format paise to rupees display string
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

// Generate a random 4-digit collection code
export function generateCollectionCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
