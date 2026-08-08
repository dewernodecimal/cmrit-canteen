'use client';

// ============================================================
// useOrders — Issue 2+9 fix
// Orders are now fetched via the authenticated server API
// (/api/orders/mine) instead of directly from Supabase anon client.
// This prevents the PII leak where anyone with the anon key could
// dump all orders/phone numbers via Supabase REST API.
// Real-time Supabase subscription is replaced by interval polling.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { OrderWithItems } from '@/types';

export function useOrders(phone: string | null) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!phone) return;
    try {
      setIsLoading(true);
      // Issue 2+9 fix: fetch from authenticated server route instead of anon Supabase client
      const password = sessionStorage.getItem('__pw') ?? '';
      const res = await fetch(`/api/orders/mine?phone=${phone}`, {
        headers: { 'x-password': password },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data as OrderWithItems[]);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Poll every 5 seconds instead of Supabase Realtime
  // (Realtime required open anon SELECT on orders which is the PII leak)
  useEffect(() => {
    if (!phone) return;

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [phone, fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
}

// Fetch a single order by ID — still uses Supabase client for real-time tracking
// of individual orders (filtered by order ID, not phone — less PII risk)
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items(*)`)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data as OrderWithItems);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Real-time subscription and fallback polling for individual order status
  useEffect(() => {
    const supabase = createClient();
    
    const channelId = `order-${orderId}-${globalThis.crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.status === 'ready') {
            toast.success('Your order is ready for pickup!');
          } else if (payload.new.status === 'cancelled') {
            toast.error('Order cancelled by canteen. Credits refunded.');
          }
          setOrder((prev) =>
            prev ? { ...prev, ...payload.new } : prev
          );
        }
      )
      .subscribe();

    // Fallback polling (every 5 seconds) just in case WebSockets fail
    const pollInterval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [orderId, fetchOrder]);

  return { order, isLoading, refetch: fetchOrder };
}
