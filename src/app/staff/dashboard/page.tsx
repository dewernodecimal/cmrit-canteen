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
import { useShopStatus } from '@/hooks/useShopStatus';

export default function StaffDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [staffPin, setStaffPin] = useState('');
  
  const { status, isActuallyOpen, refreshStatus } = useShopStatus();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Top-up state
  const [topUpPhone, setTopUpPhone] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    setStaffPin(sessionStorage.getItem('staff_pin') || '');
  }, []);

  const toggleShopManual = async () => {
    if (!status) return;
    setIsUpdatingStatus(true);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-pin': staffPin,
        },
        body: JSON.stringify({
          ...status,
          manual_close: !status.manual_close
        }),
      });
      await refreshStatus();
    } catch (err) {
      console.error('Failed to toggle shop status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsToppingUp(true);
    try {
      const res = await fetch('/api/staff/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-pin': staffPin,
        },
        body: JSON.stringify({
          phone: topUpPhone,
          amount: parseInt(topUpAmount) * 100, // stored in paise
        }),
      });
      if (res.ok) {
        alert(`Successfully added ₹${topUpAmount} to ${topUpPhone}`);
        setTopUpPhone('');
        setTopUpAmount('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add credits');
      }
    } catch (err) {
      alert('Failed to add credits');
    } finally {
      setIsToppingUp(false);
    }
  };

  const getStatusActions = (status: OrderStatus) => {
    switch (status) {
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
    confirmed: orders.filter((o) => o.status === 'confirmed'),
    in_progress: orders.filter((o) => o.status === 'in_progress'),
    ready: orders.filter((o) => o.status === 'ready'),
  };

  return (
    <div className="space-y-6">
      {/* Shop Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-brand-500/10 bg-brand-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isActuallyOpen ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">Shop Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isActuallyOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-bold text-text-secondary uppercase">
                    {isActuallyOpen ? 'Accepting Orders' : 'Currently Closed'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant={status?.manual_close ? 'primary' : 'danger'}
              size="sm"
              onClick={toggleShopManual}
              isLoading={isUpdatingStatus}
              className="font-black uppercase tracking-widest text-[10px]"
            >
              {status?.manual_close ? 'Open Shop' : 'Pause Orders'}
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-700 flex items-center justify-between text-[10px] font-black text-text-secondary uppercase tracking-widest">
            <span>Manual Status Override</span>
            <span>Status: {status?.manual_close ? 'PAUSED' : 'LIVE'}</span>
          </div>
        </Card>

        {/* Top Up Credits Form */}
        <Card className="border-emerald-500/20 bg-emerald-50 p-6 flex flex-col justify-center">
          <form onSubmit={handleTopUp} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black text-emerald-700 mb-2 uppercase tracking-widest">Top Up Wallet (Phone)</label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={topUpPhone}
                onChange={(e) => setTopUpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full h-10 px-4 rounded-xl bg-surface-700 border border-emerald-500/10 text-text-primary placeholder:text-text-secondary focus:outline-none text-xs font-bold tracking-wider transition-all"
                required
              />
            </div>
            <div className="w-full sm:w-24">
              <label className="block text-[10px] font-black text-emerald-700 mb-2 uppercase tracking-widest">₹</label>
              <input
                type="number"
                placeholder="100"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full h-10 px-4 rounded-xl bg-surface-700 border border-emerald-500/10 text-text-primary placeholder:text-text-secondary focus:outline-none text-xs font-bold transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6 font-black uppercase tracking-widest text-[10px]"
              isLoading={isToppingUp}
            >
              Add
            </Button>
          </form>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Order Queue</h1>
          <p className="text-sm text-text-secondary mt-0.5 font-medium">
            {orders.length} active {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="font-bold"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchOrders}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Empty state */}
      {orders.length === 0 && !isLoading && (
        <div className="text-center py-24 bg-surface-800 rounded-3xl border border-surface-700">
          <Clock className="w-20 h-20 text-surface-600 mx-auto mb-6" />
          <p className="text-text-primary font-bold text-xl">No active orders</p>
          <p className="text-text-secondary text-sm mt-2 font-medium">
            New orders will appear here in real-time
          </p>
        </div>
      )}

      {/* Order columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confirmed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-800 p-3 rounded-2xl border border-surface-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-sky-500 shadow-lg shadow-sky-500/20" />
              <h2 className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                New Queue
              </h2>
            </div>
            <span className="bg-surface-700 text-text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-surface-600">
              {statusGroups.confirmed.length}
            </span>
          </div>
          <div className="space-y-3">
            {statusGroups.confirmed.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-800 p-3 rounded-2xl border border-surface-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-500 shadow-lg shadow-brand-500/20" />
              <h2 className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                Preparing
              </h2>
            </div>
            <span className="bg-surface-700 text-text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-surface-600">
              {statusGroups.in_progress.length}
            </span>
          </div>
          <div className="space-y-3">
            {statusGroups.in_progress.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>

        {/* Ready */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-surface-800 p-3 rounded-2xl border border-surface-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
              <h2 className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                Ready to Go
              </h2>
            </div>
            <span className="bg-surface-700 text-text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-surface-600">
              {statusGroups.ready.length}
            </span>
          </div>
          <div className="space-y-3">
            {statusGroups.ready.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actions={getStatusActions(order.status)}
                onAction={updateStatus}
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
    <Card padding="sm" className="animate-fade-in border-surface-700 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-surface-700 pb-3">
        <div>
          {order.collection_code && order.status !== 'awaiting_verification' && (
            <div className="text-3xl font-black text-text-primary mb-1 tracking-tighter">
              #{order.collection_code}
            </div>
          )}
          {order.status === 'awaiting_verification' && order.utr_number && (
            <div className="text-sm font-black font-mono text-purple-700 mb-1">
              UTR: {order.utr_number}
            </div>
          )}
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
            {order.phone} · {timeSince}
          </p>
        </div>
        <Badge variant="info" className="font-black">{formatPrice(order.total_amount)}</Badge>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-5 px-1">
        {order.order_items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-text-primary font-bold">
              <span className="text-brand-600 font-black">{item.quantity}×</span> {item.item_name}
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
            className="flex-1 font-black uppercase tracking-tighter text-[10px] h-9"
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
