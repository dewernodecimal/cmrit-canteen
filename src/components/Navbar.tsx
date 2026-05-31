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
  const [authOpen, setAuthOpen] = useState(false);
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { phone, creditBalance, isLoggedIn, logout } = usePhone();
  const ongoingOrdersCount = useOngoingOrdersCount(phone);
  const pathname = usePathname();
  const router = useRouter();

  // Don't show navbar on staff pages
  if (pathname.startsWith('/staff')) return null;

  return (
    <>
      <nav className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm transition-shadow">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-primary leading-tight tracking-tight">
                  CMRIT <span className="text-emerald-500">Bites</span>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Credits</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-zinc-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
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
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-zinc-400 hover:text-white hover:bg-slate-700'
                }`}
                title="My Orders"
              >
                <ClipboardList className={`w-3.5 h-3.5 ${pathname === '/orders' ? 'text-white' : ''}`} />
                <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-wider">Orders</span>
                {ongoingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center shadow-sm animate-fade-in border-2 border-slate-950">
                    {ongoingOrdersCount > 9 ? '9+' : ongoingOrdersCount}
                  </span>
                )}
              </button>

              {/* Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>


      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
