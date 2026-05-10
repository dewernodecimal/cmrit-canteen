'use client';

import { useState } from 'react';
import { X, Phone, Lock, UserPlus, LogIn } from 'lucide-react';
import { usePhone } from '@/contexts/PhoneContext';
import Button from '@/components/ui/Button';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = usePhone();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setIsLoading(true);
    const fn = mode === 'login' ? login : register;
    const result = await fn(phone, password);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm glass rounded-2xl border border-white/10 shadow-2xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-xl shadow-brand-500/20 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            CMRIT <span className="text-brand-500">Bites</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {mode === 'login' ? 'Welcome back! Login to order.' : 'Join the fastest canteen experience.'}
          </p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-700 border border-surface-600 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-500/50 focus:bg-surface-600 transition-all text-base"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              {mode === 'register' ? 'Set a Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="password"
                placeholder={mode === 'register' ? 'Min. 4 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-700 border border-surface-600 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-500/50 focus:bg-surface-600 transition-all text-base"
                required
              />
            </div>
          </div>


          {/* Error */}
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            icon={mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          >
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-xs text-text-secondary mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-brand-500 hover:text-brand-600 font-bold transition-colors"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>

      </div>
    </div>
  );
}
