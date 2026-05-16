'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, UtensilsCrossed, Wallet, LogIn, LogOut, PlusCircle, Sun, Moon, ClipboardList } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import { useOngoingOrdersCount } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/constants';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { totalItems } = useCart();
  const { phone, creditBalance, isLoggedIn, logout } = usePhone();
  const ongoingOrdersCount = useOngoingOrdersCount(phone);
  const pathname = usePathname();
  const router = useRouter();

  // Don't show navbar on staff pages
  if (pathname.startsWith('/staff')) return null;

  return (
    <>
      <nav className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-primary leading-tight tracking-tight">
                  CMRIT <span className="gradient-text">Bites</span>
                </h1>
              </div>

            </Link>


            {/* Right side */}
            <div className="flex items-center gap-2">
              {isLoggedIn && phone ? (
                <>
                  {/* Wallet balance */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">
                      {formatPrice(creditBalance)}
                    </span>
                  </div>

                  {/* Add Credits link */}
                  <Link
                    href="/wallet"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-400 hover:bg-brand-500/20 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Credits</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 rounded-xl glass-light hover:bg-surface-600 transition-colors text-zinc-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-400 hover:bg-brand-500/20 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login / Register
                </button>
              )}

              {/* My Orders button (Always visible) */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    router.push('/orders');
                  } else {
                    setAuthOpen(true);
                  }
                }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                  pathname === '/orders'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                    : 'bg-surface-700 border-surface-600 text-text-secondary hover:text-text-primary hover:bg-surface-600'
                }`}
                title="My Orders"
              >
                <ClipboardList className={`w-3.5 h-3.5 ${pathname === '/orders' ? 'text-white' : ''}`} />
                <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-wider">Orders</span>
                {ongoingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center shadow-md animate-fade-in border-2 border-surface-900">
                    {ongoingOrdersCount > 9 ? '9+' : ongoingOrdersCount}
                  </span>
                )}
              </button>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl glass-light hover:bg-surface-600 transition-colors cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5 text-zinc-500 group-hover:text-brand-500 transition-colors" />
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
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
