'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import StockBadge from './StockBadge';
import { formatPrice } from '@/lib/constants';
import type { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
  demandCount?: number;
}

export default function MenuCard({ item, demandCount = 0 }: MenuCardProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const isSoldOut = !item.is_available || item.current_stock <= 0;
  const isHighDemand = demandCount >= 10;

  return (
    <div
      className={`
        glass rounded-[var(--radius-card)] overflow-hidden
        transition-all duration-300 group
        ${isSoldOut ? 'opacity-60' : 'hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5'}
      `}
    >
      {/* Image */}
      <div className="relative h-44 bg-surface-700 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {item.category === 'snacks' ? '🍿' :
             item.category === 'meals' ? '🍛' :
             item.category === 'beverages' ? '☕' : '🍰'}
          </div>
        )}

        {/* Stock badge overlay */}
        <div className="absolute top-3 right-3">
          <StockBadge
            currentStock={item.current_stock}
            dailyStockCap={item.daily_stock_cap}
            isAvailable={item.is_available}
          />
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-lg font-bold text-white/80">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-base truncate">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
        )}

        {/* High demand warning */}
        {isHighDemand && !isSoldOut && (
          <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <p className="text-[11px] text-amber-400 font-medium">
              ⚡ High Demand: Many students ordered this, expect a longer wait
            </p>
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-lg font-bold gradient-text">
            {formatPrice(item.price)}
          </span>

          {!isSoldOut && (
            <div className="flex items-center gap-1">
              {quantity > 0 ? (
                <>
                  <button
                    onClick={() =>
                      quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, quantity - 1)
                    }
                    className="p-1.5 rounded-lg bg-surface-600 text-zinc-300 hover:text-white hover:bg-surface-500 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    disabled={quantity >= item.current_stock}
                    className="p-1.5 rounded-lg gradient-brand text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => addItem(item)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-button)] gradient-brand text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
