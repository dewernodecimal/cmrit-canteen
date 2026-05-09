'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ChefHat,
  Package,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPrice, ORDER_STATUS_CONFIG } from '@/lib/constants';
import type { OrderWithItems, OrderStatus } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function StaffDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [staffPin, setStaffPin] = useState('');

  useEffect(() => {
    setStaffPin(sessionStorage.getItem('staff_pin') || '');
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'x-staff-pin': staffPin },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [staffPin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('staff-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus, cancelReason?: string) => {
    setUpdating(orderId);
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-pin': staffPin,
        },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
          cancel_reason: cancelReason,
        }),
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setUpdating(null);
    }
  };

  const verifyUtr = async (orderId: string, action: 'approve' | 'reject') => {
    setUpdating(orderId);
    try {
      await fetch('/api/orders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-pin': staffPin,
        },
        body: JSON.stringify({
          order_id: orderId,
          action,
        }),
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to verify UTR:', err);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusActions = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_verification':
        return [
          {
            label: 'Verify',
            action: 'approve',
            icon: <CheckCircle2 className="w-4 h-4" />,
            variant: 'primary' as const,
          },
          {
            label: 'Reject',
            action: 'reject',
            icon: <XCircle className="w-4 h-4" />,
            variant: 'danger' as const,
          },
        ];
      case 'confirmed':
        return [
          {
            label: 'Start Preparing',
            status: 'in_progress' as OrderStatus,
            icon: <ChefHat className="w-4 h-4" />,
            variant: 'primary' as const,
          },
          {
            label: 'Cancel & Credit',
            status: 'cancelled' as OrderStatus,
            icon: <XCircle className="w-4 h-4" />,
            variant: 'danger' as const,
          },
        ];
      case 'in_progress':
        return [
          {
            label: 'Mark Ready',
            status: 'ready' as OrderStatus,
            icon: <Package className="w-4 h-4" />,
            variant: 'primary' as const,
          },
        ];
      case 'ready':
        return [
          {
            label: 'Complete',
            status: 'completed' as OrderStatus,
            icon: <CheckCircle2 className="w-4 h-4" />,
            variant: 'primary' as const,
          },
        ];
      default:
        return [];
    }
  };

  const statusGroups = {
    awaiting_verification: orders.filter((o) => o.status === 'awaiting_verification'),
    confirmed: orders.filter((o) => o.status === 'confirmed'),
    in_progress: orders.filter((o) => o.status === 'in_progress'),
    ready: orders.filter((o) => o.status === 'ready'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Order Queue</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {orders.length} active {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchOrders}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Empty state */}
      {orders.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <Clock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">No active orders</p>
          <p className="text-zinc-500 text-xs mt-1">
            New orders will appear here in real-time
          </p>
        </div>
      )}

      {/* Order columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto">
        {/* Awaiting Verification */}
        <div className="min-w-[250px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Verify UTR ({statusGroups.awaiting_verification.length})
            </h2>
          </div>
          <div className="space-y-3">
            {statusGroups.awaiting_verification.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
                onVerify={verifyUtr}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>

        {/* Confirmed */}
        <div className="min-w-[250px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              New ({statusGroups.confirmed.length})
            </h2>
          </div>
          <div className="space-y-3">
            {statusGroups.confirmed.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
                onVerify={verifyUtr}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-brand-400" />
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Preparing ({statusGroups.in_progress.length})
            </h2>
          </div>
          <div className="space-y-3">
            {statusGroups.in_progress.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
                onVerify={verifyUtr}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>

        {/* Ready */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Ready ({statusGroups.ready.length})
            </h2>
          </div>
          <div className="space-y-3">
            {statusGroups.ready.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
                onVerify={verifyUtr}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Order Card (Staff View)
// ============================================================

interface OrderCardProps {
  order: OrderWithItems;
  actions: {
    label: string;
    status?: OrderStatus;
    action?: 'approve' | 'reject';
    icon: React.ReactNode;
    variant: 'primary' | 'danger';
  }[];
  onAction: (orderId: string, status: OrderStatus, reason?: string) => void;
  onVerify?: (orderId: string, action: 'approve' | 'reject') => void;
  isUpdating: boolean;
}

function OrderCard({ order, actions, onAction, onVerify, isUpdating }: OrderCardProps) {
  const timeSince = getTimeSince(new Date(order.created_at));

  return (
    <Card padding="sm" className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {order.collection_code && order.status !== 'awaiting_verification' && (
            <div className="text-2xl font-bold font-mono gradient-text mb-1">
              #{order.collection_code}
            </div>
          )}
          {order.status === 'awaiting_verification' && order.utr_number && (
            <div className="text-sm font-bold font-mono text-purple-400 mb-1">
              UTR: {order.utr_number}
            </div>
          )}
          <p className="text-xs text-zinc-500">
            {order.phone} · {timeSince}
          </p>
        </div>
        <Badge variant="info">{formatPrice(order.total_amount)}</Badge>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-4">
        {order.order_items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-zinc-300">
              {item.quantity}× {item.item_name}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {actions.map((actionBtn, idx) => (
          <Button
            key={idx}
            variant={actionBtn.variant}
            size="sm"
            icon={actionBtn.icon}
            onClick={() => {
              if (actionBtn.action && onVerify) {
                 onVerify(order.id, actionBtn.action);
              } else if (actionBtn.status) {
                if (actionBtn.status === 'cancelled') {
                  if (confirm('Cancel this order and issue credit?')) {
                    onAction(order.id, actionBtn.status, 'Cancelled by staff');
                  }
                } else {
                  onAction(order.id, actionBtn.status);
                }
              }
            }}
            isLoading={isUpdating}
            className="flex-1"
          >
            {actionBtn.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
