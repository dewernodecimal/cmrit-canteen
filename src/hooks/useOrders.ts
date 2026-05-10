'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Order, OrderWithItems } from '@/types';

export function useOrders(phone: string | null) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!phone) return;
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items(*)`)
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
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

  // Real-time subscription for order status changes
  useEffect(() => {
    if (!phone) return;

    const supabase = createClient();
    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE)
          schema: 'public',
          table: 'orders',
          filter: `phone=eq.${phone}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Re-fetch to get order_items as well
            fetchOrders();
            toast.success('Order placed successfully! Check My Orders.');
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'cancelled') {
              toast.error('Order cancelled by canteen. Credits have been refunded.');
            } else if (payload.new.status === 'ready') {
              toast.success('Your order is ready for pickup!');
            }
            
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [phone]);

  return { orders, isLoading, refetch: fetchOrders };
}

// Fetch a single order by ID
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

  // Real-time subscription and fallback polling
  useEffect(() => {
    const supabase = createClient();
    
    // Real-time WebSocket
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
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
