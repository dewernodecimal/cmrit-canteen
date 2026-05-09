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
    <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 animate-fade-in">
      {/* Item emoji/icon */}
      <div className="w-12 h-12 rounded-xl bg-surface-600 flex items-center justify-center text-2xl shrink-0">
        {menuItem.category === 'snacks' ? '🍿' :
         menuItem.category === 'meals' ? '🍛' :
         menuItem.category === 'beverages' ? '☕' : '🍰'}
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">
          {menuItem.name}
        </h4>
        <p className="text-xs text-zinc-400 mt-0.5">
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
          className="p-1 rounded-md bg-surface-600 text-zinc-400 hover:text-white hover:bg-surface-500 transition-colors cursor-pointer"
        >
          {quantity === 1 ? (
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
        </button>
        <span className="w-7 text-center text-sm font-semibold text-white">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
          disabled={quantity >= menuItem.current_stock}
          className="p-1 rounded-md gradient-brand text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Line total */}
      <span className="text-sm font-semibold text-brand-400 w-16 text-right">
        {formatPrice(menuItem.price * quantity)}
      </span>
    </div>
  );
}
