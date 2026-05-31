'use client';

import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/constants';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const { totalItems, totalAmount, isCartOpen, setIsCartOpen } = useCart();
  const pathname = usePathname();

  // Hide the floating cart bar on checkout, order status, and staff counter pages
  if (
    totalItems === 0 ||
    isCartOpen ||
    pathname === '/cart' ||
    pathname.startsWith('/order') ||
    pathname.startsWith('/staff')
  ) {
    return null;
  }


  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 z-40 animate-slide-up pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="w-full flex items-center justify-between bg-brand-500 text-white p-4 rounded-2xl shadow-2xl shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-white/80">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
              <p className="text-sm font-bold text-white">{formatPrice(totalAmount)}</p>
            </div>

          </div>
          
          <div className="flex items-center gap-1 font-black text-sm uppercase tracking-wider">
            View Cart
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
