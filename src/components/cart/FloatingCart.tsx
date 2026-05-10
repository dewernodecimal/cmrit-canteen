'use client';

import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/constants';
import Link from 'next/link';

export default function FloatingCart() {
  const { cart, totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-slide-up">
      <Link 
        href="/cart"
        className="flex items-center justify-between bg-brand-500 text-white p-4 rounded-2xl shadow-2xl shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/80">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            <p className="text-sm font-bold text-white">{formatPrice(totalPrice)} plus taxes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 font-black text-sm uppercase tracking-wider">
          View Cart
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
