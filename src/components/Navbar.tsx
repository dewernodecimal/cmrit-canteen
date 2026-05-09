'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, UtensilsCrossed, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import { formatPrice } from '@/lib/constants';
import CartDrawer from '@/components/cart/CartDrawer';

export default function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { phone, creditBalance } = usePhone();
  const pathname = usePathname();

  // Don't show navbar on staff pages
  if (pathname.startsWith('/staff')) return null;

  return (
    <>
      <nav className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  CMRIT <span className="gradient-text">Canteen</span>
                </h1>
              </div>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Credits badge */}
              {phone && creditBalance > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">
                    {formatPrice(creditBalance)}
                  </span>
                </div>
              )}

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl glass-light hover:bg-surface-600 transition-colors cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-brand text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
