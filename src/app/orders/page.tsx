'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Receipt, CheckCircle, XCircle, Package } from 'lucide-react';
import { usePhone } from '@/contexts/PhoneContext';
import { useOrders } from '@/hooks/useOrders';
import AuthModal from '@/components/AuthModal';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { formatPrice, ORDER_STATUS_CONFIG } from '@/lib/constants';

export default function OrdersPage() {
  const { phone, isLoggedIn } = usePhone();
  const { orders, isLoading } = useOrders(phone);
  const [authOpen, setAuthOpen] = useState(false);

  // If not logged in after checking, show the auth modal
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setAuthOpen(true);
    }
  }, [isLoading, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
        <Receipt className="w-16 h-16 mx-auto text-surface-400 mb-6" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">My Orders</h2>
        <p className="text-text-secondary mb-8">Please log in to view your orders.</p>
        <button
          onClick={() => setAuthOpen(true)}
          className="px-6 py-3 rounded-xl gradient-brand text-white font-bold hover:shadow-lg transition-all"
        >
          Login to View Orders
        </button>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const preparingOrders = orders.filter((o) =>
    ['pending_payment', 'awaiting_verification', 'confirmed', 'in_progress'].includes(o.status)
  );
  
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const pastOrders = orders.filter((o) => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/menu"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black text-text-primary">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-16 h-16 mx-auto text-surface-400 mb-4" />
          <p className="text-text-secondary mb-6">You haven't placed any orders yet.</p>
          <Link href="/menu" className="text-brand-500 font-bold hover:text-brand-600 transition-colors">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Ready for Pickup (Most Important) */}
          {readyOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Ready to Pickup
              </h2>
              <div className="space-y-4 stagger-children">
                {readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} statusType="ready" />
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Ongoing Orders (Preparing) */}
          {preparingOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                Ongoing Orders
              </h2>
              <div className="space-y-4 stagger-children">
                {preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} statusType="ongoing" />
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Past Orders */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4">
                Past Orders
              </h2>
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} statusType="past" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, statusType }: { order: any; statusType: 'ready' | 'ongoing' | 'past' }) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  
  // Custom tag styling for Past Orders as requested: Red for cancelled, Grey for collected
  const tagStyles = order.status === 'cancelled' 
    ? 'bg-rose-50 text-rose-700 border-rose-100' 
    : order.status === 'completed' 
    ? 'bg-surface-700 text-zinc-600 border-surface-600'
    : `${statusConfig?.bgColor} ${statusConfig?.color} border-transparent`;

  const showCode = (statusType === 'ready' || statusType === 'ongoing') && 
                   order.collection_code && 
                   ['confirmed', 'in_progress', 'ready'].includes(order.status);

  return (
    <Link href={`/order/${order.id}`}>
      <Card className={`hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all cursor-pointer group ${statusType === 'ready' ? 'border-emerald-500/30 bg-emerald-50/10' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-text-secondary">#{order.id.slice(0, 8)}</span>
              <span className="text-[10px] text-text-tertiary">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${tagStyles}`}
            >
              {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
              {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}
              {statusType === 'ongoing' && <Clock className="w-3 h-3" />}
              {statusType === 'ready' && <Package className="w-3 h-3" />}
              {statusConfig?.label}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-text-primary">{formatPrice(order.total_amount)}</span>
            <p className="text-xs text-text-secondary mt-0.5">{order.order_items.length} items</p>
          </div>
        </div>

        {/* Collection Code Highlight */}
        {showCode && (
          <div className="mt-4 pt-4 border-t border-surface-700">
            <div className={`flex items-center justify-between rounded-xl p-3 border group-hover:bg-brand-500/15 transition-colors ${statusType === 'ready' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-brand-500/10 border-brand-500/20'}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${statusType === 'ready' ? 'text-emerald-700' : 'text-brand-600'}`}>Collection Code</span>
              <span className={`text-xl font-black tracking-[0.2em] ${statusType === 'ready' ? 'text-emerald-700' : 'text-brand-600'}`}>{order.collection_code}</span>
            </div>
          </div>
        )}

        {/* Items Summary */}
        <div className="mt-4 pt-4 border-t border-surface-700 flex flex-wrap gap-1.5 opacity-80">
          {order.order_items.map((item: any, i: number) => (
            <span key={item.id} className="text-xs text-text-secondary">
              {item.quantity}x {item.item_name}
              {i < order.order_items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  );
}
