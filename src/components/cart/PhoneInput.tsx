'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone } from 'lucide-react';
import Input from '@/components/ui/Input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(raw);
  };

  // Format for display: XXX XXX XXXX
  const displayValue = value
    ? value.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3').trim()
    : '';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        Phone Number
      </label>
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)]
          bg-surface-700 border transition-all duration-200
          ${focused ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-white/10'}
          ${error ? 'border-rose-500/50 ring-2 ring-rose-500/20' : ''}
        `}
      >
        <div className="flex items-center gap-2 text-zinc-400 shrink-0">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">+91</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <input
          ref={inputRef}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter your 10-digit number"
          className="flex-1 bg-transparent text-white text-sm tracking-wider placeholder-zinc-500 focus:outline-none"
          maxLength={12} /* 10 digits + 2 spaces */
        />
        {value.length === 10 && (
          <span className="text-emerald-400 text-sm">✓</span>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-[11px] text-zinc-500">
        Used for your canteen credits — no login required
      </p>
    </div>
  );
}
