'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Package, LogOut } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function StaffLayout({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        headers: { 'x-staff-pin': pin },
      });

      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('staff_pin', pin);
      } else {
        setError('Invalid PIN');
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
        <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-6 animate-slide-up">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-brand mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Staff Access</h2>
            <p className="text-sm text-zinc-400 mt-1">
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
            className="w-full"
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
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 glass border-r border-white/5 p-4 hidden sm:flex flex-col">
        <div className="space-y-1 flex-1">
          <Link
            href="/staff/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/staff/dashboard'
                ? 'gradient-brand text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Order Queue
          </Link>
          <Link
            href="/staff/inventory"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/staff/inventory'
                ? 'gradient-brand text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory
          </Link>
        </div>

        <button
          onClick={() => {
            setAuthenticated(false);
            setPin('');
            sessionStorage.removeItem('staff_pin');
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-rose-400 hover:bg-rose-400/5 transition-colors cursor-pointer"
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
