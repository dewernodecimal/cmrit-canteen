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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'login' ? 'Login to access your wallet' : 'Set up your canteen wallet'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-700 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              {mode === 'register' ? 'Set a PIN / Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder={mode === 'register' ? 'Min. 4 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-700 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
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
        <p className="text-center text-xs text-zinc-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
