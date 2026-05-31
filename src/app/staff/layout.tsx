'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { LayoutDashboard, LogOut, Package, ShieldCheck } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function StaffLayout({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  /**
   * Handles staff PIN authentication with client-side rate limiting.
   * Restricts attempts to 5 failures before imposing a 60-second cool-down lockout.
   */
  const handleAuth = async () => {
    const lockUntil = localStorage.getItem('staff_lock_until');
    if (lockUntil && Date.now() < parseInt(lockUntil, 10)) {
      const remainingSeconds = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${remainingSeconds}s.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        headers: { 'x-staff-pin': pin },
      });

      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('staff_pin', pin);
        localStorage.removeItem('staff_attempts');
        localStorage.removeItem('staff_lock_until');
      } else {
        const attempts = parseInt(localStorage.getItem('staff_attempts') || '0', 10) + 1;
        if (attempts >= 5) {
          const lockTime = Date.now() + 60 * 1000; // 1 minute lockout
          localStorage.setItem('staff_lock_until', lockTime.toString());
          localStorage.setItem('staff_attempts', '0');
          setError('Too many attempts. Try again in 60s.');
        } else {
          localStorage.setItem('staff_attempts', attempts.toString());
          setError(`Invalid PIN. ${5 - attempts} attempts remaining.`);
        }
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Check sessionStorage on mount (client-only)
  useEffect(() => {
    const savedPin = sessionStorage.getItem('staff_pin');
    if (savedPin) {
      setPin(savedPin);
      setAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // Don't render anything until we've checked session — prevents flash of dashboard
  if (isChecking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="bg-surface-800 border border-surface-700 rounded-3xl p-10 w-full max-w-sm space-y-8 animate-slide-up shadow-2xl shadow-surface-900/10">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-brand-500 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-brand-500/20">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Staff Access</h2>
            <p className="text-sm text-text-secondary mt-2 font-medium">
              Enter your staff PIN to continue
            </p>
          </div>

          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={error}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />

          <Button
            size="lg"
            className="w-full shadow-lg shadow-brand-500/20"
            onClick={handleAuth}
            isLoading={loading}
          >
            Unlock Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-surface-900">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-surface-800 border-r border-surface-700 p-6 hidden sm:flex flex-col shadow-sm">
        <div className="space-y-2 flex-1">
          <Link
            href="/staff/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              pathname === '/staff/dashboard'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Order Queue
          </Link>
          <Link
            href="/staff/inventory"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              pathname === '/staff/inventory'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory
          </Link>
          <Link
            href="/staff/transactions"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              pathname === '/staff/transactions'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Transactions
          </Link>
        </div>

        <button
          onClick={() => {
            setAuthenticated(false);
            setPin('');
            sessionStorage.removeItem('staff_pin');
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer mt-auto"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>


      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
