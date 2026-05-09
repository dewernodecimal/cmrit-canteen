'use client';

// ============================================================
// Phone Context — Auth & Identity Management
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

interface PhoneContextType {
  phone: string | null;
  creditBalance: number;
  isLoading: boolean;
  isLoggedIn: boolean;
  setPhone: (phone: string) => void;
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  register: (phone: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  refreshCredits: () => Promise<void>;
  // Legacy compat
  clearPhone: () => void;
}

const PhoneContext = createContext<PhoneContextType | null>(null);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCredits = useCallback(async (phoneNum: string) => {
    try {
      const res = await fetch(`/api/credits?phone=${phoneNum}`);
      if (res.ok) {
        const data = await res.json();
        setCreditBalance(data.credit_balance || 0);
      } else {
        setCreditBalance(0);
      }
    } catch {
      setCreditBalance(0);
    }
  }, []);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEYS.PHONE);
    const loggedIn = sessionStorage.getItem('is_logged_in') === 'true';
    if (stored && /^\d{10}$/.test(stored) && loggedIn) {
      setPhoneState(stored);
      setIsLoggedIn(true);
      fetchCredits(stored);
    }
    setIsLoading(false);
  }, [fetchCredits]);

  const login = useCallback(async (phoneNum: string, password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', phone: phoneNum, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    
    setPhoneState(phoneNum);
    setIsLoggedIn(true);
    setCreditBalance(data.credit_balance || 0);
    sessionStorage.setItem(STORAGE_KEYS.PHONE, phoneNum);
    sessionStorage.setItem('is_logged_in', 'true');
    return {};
  }, []);

  const register = useCallback(async (phoneNum: string, password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', phone: phoneNum, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };

    setPhoneState(phoneNum);
    setIsLoggedIn(true);
    setCreditBalance(data.credit_balance || 0);
    sessionStorage.setItem(STORAGE_KEYS.PHONE, phoneNum);
    sessionStorage.setItem('is_logged_in', 'true');
    return {};
  }, []);

  const logout = useCallback(() => {
    setPhoneState(null);
    setIsLoggedIn(false);
    setCreditBalance(0);
    sessionStorage.removeItem(STORAGE_KEYS.PHONE);
    sessionStorage.removeItem('is_logged_in');
  }, []);

  // Legacy compat
  const setPhone = useCallback((num: string) => {
    setPhoneState(num);
    sessionStorage.setItem(STORAGE_KEYS.PHONE, num);
    fetchCredits(num);
  }, [fetchCredits]);

  const refreshCredits = useCallback(async () => {
    if (phone) await fetchCredits(phone);
  }, [phone, fetchCredits]);

  return (
    <PhoneContext.Provider
      value={{ phone, creditBalance, isLoading, isLoggedIn, setPhone, login, register, logout, refreshCredits, clearPhone: logout }}
    >
      {children}
    </PhoneContext.Provider>
  );
}

export function usePhone() {
  const ctx = useContext(PhoneContext);
  if (!ctx) throw new Error('usePhone must be used within PhoneProvider');
  return ctx;
}
