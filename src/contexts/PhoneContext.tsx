'use client';

// ============================================================
// Phone Context — Guest Identity Management
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
  setPhone: (phone: string) => void;
  clearPhone: () => void;
  refreshCredits: () => Promise<void>;
}

const PhoneContext = createContext<PhoneContextType | null>(null);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch credit balance from API
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
      // Profile might not exist yet or connection issue — that's fine
      setCreditBalance(0);
    }
  }, []);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEYS.PHONE);
    if (stored && /^\d{10}$/.test(stored)) {
      setPhoneState(stored);
      fetchCredits(stored);
    }
    setIsLoading(false);
  }, [fetchCredits]);

  const setPhone = useCallback(
    (num: string) => {
      setPhoneState(num);
      sessionStorage.setItem(STORAGE_KEYS.PHONE, num);
      fetchCredits(num);
    },
    [fetchCredits]
  );

  const clearPhone = useCallback(() => {
    setPhoneState(null);
    setCreditBalance(0);
    sessionStorage.removeItem(STORAGE_KEYS.PHONE);
  }, []);

  const refreshCredits = useCallback(async () => {
    if (phone) {
      await fetchCredits(phone);
    }
  }, [phone, fetchCredits]);

  return (
    <PhoneContext.Provider
      value={{ phone, creditBalance, isLoading, setPhone, clearPhone, refreshCredits }}
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
