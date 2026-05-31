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
  const isNonVeg = /chicken|egg|mutton|fish/i.test(item.name) || /chicken|egg|mutton|fish/i.test(item.description || '');

  return (
    <div
      className={`
        flex flex-row gap-4 p-4 bg-zinc-950 border border-zinc-900 rounded-2xl
        transition-all duration-300 relative
        ${!canOrder ? 'opacity-60 grayscale-[0.2]' : ''}
      `}
    >
      {/* Status overlay (Closed) */}
      {!isShopOpen && (
        <div className="absolute inset-0 z-20 bg-zinc-950/70 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
          <span className="text-lg font-black text-white tracking-widest uppercase">Closed</span>
        </div>
      )}

      {/* Content Section (Left) */}
      <div className="flex-1 flex flex-col pt-1">
        <div className="flex items-center gap-2 mb-1">
          {/* Veg/Non-Veg Indicator */}
          <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 ${isNonVeg ? 'border-red-600' : 'border-emerald-500'}`}>
            {isNonVeg ? (
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600 mb-0.5" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          {isHighDemand && !isSoldOut && (
            <span className="text-[10px] font-black text-emerald-500 tracking-tighter uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Bestseller
            </span>
          )}
        </div>
        
        <h3 className="font-extrabold text-zinc-100 text-base leading-tight tracking-tight line-clamp-2 mb-1">
          {item.name}
        </h3>
        
        <span className="text-sm font-bold text-zinc-100 tracking-tight mb-2">
          {formatPrice(item.price)}
        </span>
        
        {item.description && (
          <p className="text-xs font-medium text-zinc-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Image & Action Section (Right) */}
      <div className="relative w-[120px] shrink-0 flex flex-col items-center">
        {/* Image Frame */}
        <div className="w-full h-[120px] relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/50">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="120px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {item.category === 'snacks' ? '🍿' :
               item.category === 'meals' ? '🍛' :
               item.category === 'beverages' ? '☕' : '🍰'}
            </div>
          )}
          
          {/* Stock overlay on image if sold out */}
          {isShopOpen && isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[10px] font-black text-white tracking-widest uppercase">Sold Out</span>
            </div>
          )}
        </div>

        {/* Floating Action Button overlapping bottom edge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[100px] z-10">
          {canOrder && (
            <>
              {quantity > 0 ? (
                <div className="flex items-center justify-between h-10 w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                  <button
                    onClick={() =>
                      quantity === 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, quantity - 1)
                    }
                    className="flex-1 h-full flex items-center justify-center text-emerald-500 hover:bg-zinc-800 transition-colors"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center text-sm font-black text-emerald-500">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    disabled={quantity >= item.current_stock}
                    className="flex-1 h-full flex items-center justify-center text-emerald-500 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item)}
                  className="w-full h-10 flex items-center justify-center bg-white text-emerald-600 text-[13px] font-extrabold uppercase tracking-tight rounded-xl shadow-xl shadow-black/50 hover:bg-zinc-100 transition-colors"
                >
                  ADD
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
