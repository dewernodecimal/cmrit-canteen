import { useState, useEffect, useCallback } from 'react';

interface ShopStatus {
  is_open: boolean;
  manual_close: boolean;
  opening_time: string; // "HH:MM"
  closing_time: string; // "HH:MM"
}

export function useShopStatus() {
  const [status, setStatus] = useState<ShopStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch shop status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every minute for status changes
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const checkIfOpen = () => {
    if (!status) return true; // Default to open if not loaded
    return !status.manual_close;
  };

  const isActuallyOpen = checkIfOpen();

  return { 
    status, 
    isActuallyOpen, 
    isLoading,
    refreshStatus: fetchStatus 
  };
}
