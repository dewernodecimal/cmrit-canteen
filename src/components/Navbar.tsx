'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, UtensilsCrossed, Wallet, LogIn, LogOut, PlusCircle, Sun, Moon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice } from '@/lib/constants';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { totalItems } = useCart();
  const { phone, creditBalance, isLoggedIn, logout } = usePhone();
  const { theme, toggleTheme } = useTheme();
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

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl glass-light hover:bg-surface-600 transition-colors text-zinc-300 hover:text-white"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

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
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
