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
        ${isSoldOut ? 'opacity-60' : 'hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1'}
      `}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-surface-700 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-600">
            {item.category === 'snacks' ? '🍿' :
             item.category === 'meals' ? '🍛' :
             item.category === 'beverages' ? '☕' : '🍰'}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Bestseller Badge (Blinkit/Zomato style) */}
        {isHighDemand && !isSoldOut && (
          <div className="absolute top-3 left-3 bg-highlight px-2 py-1 rounded-md shadow-lg animate-pulse">
            <span className="text-[10px] font-black text-black tracking-tighter">BESTSELLER</span>
          </div>
        )}

        {/* Stock status overlay */}
        <div className="absolute top-3 right-3">
          <StockBadge
            currentStock={item.current_stock}
            dailyStockCap={item.daily_stock_cap}
            isAvailable={item.is_available}
          />
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xl font-black text-white/90 tracking-widest uppercase">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{item.name}</h3>
          <span className="text-lg font-black text-white shrink-0">
            {formatPrice(item.price)}
          </span>
        </div>
        
        {item.description && (
          <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 min-h-[2.5em] leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Footer: Add to Cart */}
        <div className="mt-5 flex items-center justify-end">
          {!isSoldOut && (
            <div className="relative">
              {quantity > 0 ? (
                <div className="flex items-center bg-brand-500 rounded-xl shadow-lg shadow-brand-500/20 overflow-hidden animate-fade-in">
                  <button
                    onClick={() =>
                      quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, quantity - 1)
                    }
                    className="px-3 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    disabled={quantity >= item.current_stock}
                    className="px-3 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item)}
                  className="flex items-center gap-1 px-6 py-2 rounded-xl bg-white border border-brand-200 text-brand-500 text-sm font-black shadow-sm hover:bg-brand-50 transition-all cursor-pointer transform active:scale-95"
                >
                  ADD
                  <Plus className="w-3.5 h-3.5 stroke-[4] ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
