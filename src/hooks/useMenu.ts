'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '@/types';
import { createClient } from '@/lib/supabase/client';

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setItems(data as MenuItem[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setError('Failed to load menu. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Subscribe to real-time stock updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('menu-stock')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_items' },
        (payload) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id
                ? { ...item, ...payload.new }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { items, isLoading, error, refetch: fetchMenu };
}
