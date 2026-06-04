'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Returns a map of menu_item_id → count of pending/in-progress orders
export function useHighDemand() {
  const [demandMap, setDemandMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        const supabase = createClient();

        // Count pending/in-progress order items per menu_item_id
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            menu_item_id,
            orders!inner(status)
          `)
          .in('orders.status', ['confirmed', 'in_progress']);

        if (error) throw error;

        // Aggregate counts
        const counts: Record<string, number> = {};
        for (const row of data || []) {
          const id = row.menu_item_id;
          counts[id] = (counts[id] || 0) + 1;
        }
        setDemandMap(counts);
      } catch (err) {
        console.error('Failed to fetch demand:', err);
      }
    };

    fetchDemand();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDemand, 30_000);
    return () => clearInterval(interval);
  }, []);

  return demandMap;
}
