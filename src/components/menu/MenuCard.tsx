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
  isShopOpen?: boolean;
}

export default function MenuCard({ item, demandCount = 0, isShopOpen = true }: MenuCardProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const isSoldOut = !item.is_available || item.current_stock <= 0;
  const isHighDemand = demandCount >= 10;
  const canOrder = isShopOpen && !isSoldOut;

  return (
    <div
      className={`
        glass rounded-[var(--radius-card)] overflow-hidden
        transition-all duration-300 group
        ${!canOrder ? 'opacity-60' : 'hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1'}
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

        {/* Bestseller Badge */}
        {isHighDemand && !isSoldOut && (
          <div className="absolute top-3 left-3 bg-brand-500 px-2 py-1 rounded-md shadow-lg shadow-brand-500/20">
            <span className="text-[10px] font-black text-white tracking-tighter">BESTSELLER</span>
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

        {/* Status overlay (Sold out or Closed) */}
        {!isShopOpen ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
             <span className="text-xl font-black text-text-primary tracking-widest uppercase">Closed</span>
          </div>
        ) : isSoldOut ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xl font-black text-text-primary tracking-widest uppercase">Sold Out</span>
          </div>
        ) : null}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-text-primary text-lg leading-tight line-clamp-1">{item.name}</h3>
          <span className="text-lg font-black text-brand-500 shrink-0">
            {formatPrice(item.price)}
          </span>
        </div>
        
        {item.description && (
          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 min-h-[2.5em] leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Footer: Add to Cart */}
        <div className="mt-5 flex items-center justify-end">
          {canOrder && (
            <div className="relative">
              {quantity > 0 ? (
                <div className="flex items-center bg-surface-700 rounded-xl overflow-hidden animate-fade-in border border-surface-600">
                  <button
                    onClick={() =>
                      quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, quantity - 1)
                    }
                    className="px-3 py-2 text-brand-500 hover:bg-brand-500/10 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    disabled={quantity >= item.current_stock}
                    className="px-3 py-2 text-brand-500 hover:bg-brand-500/10 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item)}
                  className="flex items-center gap-1 px-6 py-2 rounded-xl bg-brand-500 text-white text-sm font-black shadow-lg shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5 transition-all cursor-pointer transform active:scale-95"
                >
                  ADD
                  <Plus className="w-3.5 h-3.5 stroke-[4] ml-1" />
                </button>
              )}
            </div>
          )}
          {!isShopOpen && (
            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-3 py-2 rounded-lg border border-rose-500/10">
              Closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
