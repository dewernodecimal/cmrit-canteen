'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/constants';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { menuItem, quantity } = item;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-surface-700 last:border-0 animate-fade-in px-4">
      {/* Item emoji/icon */}
      <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center text-2xl shrink-0">
        {menuItem.category === 'snacks' ? '🍿' :
         menuItem.category === 'meals' ? '🍛' :
         menuItem.category === 'beverages' ? '☕' : '🍰'}
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-text-primary truncate">
          {menuItem.name}
        </h4>
        <p className="text-xs text-text-secondary mt-0.5">
          {formatPrice(menuItem.price)} each
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() =>
            quantity === 1
              ? removeItem(menuItem.id)
              : updateQuantity(menuItem.id, quantity - 1)
          }
          className="p-1 rounded-lg bg-surface-700 text-text-secondary hover:text-text-primary hover:bg-surface-600 transition-colors cursor-pointer"
        >
          {quantity === 1 ? (
            <Trash2 className="w-4 h-4 text-rose-600" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
        </button>
        <span className="w-7 text-center text-sm font-bold text-text-primary">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
          disabled={quantity >= menuItem.current_stock}
          className="p-1 rounded-lg bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Line total */}
      <span className="text-sm font-black text-brand-500 w-16 text-right">
        {formatPrice(menuItem.price * quantity)}
      </span>
    </div>

  );
}
