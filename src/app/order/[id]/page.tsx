'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import CollectionCode from '@/components/order/CollectionCode';
import OrderTimeline from '@/components/order/OrderTimeline';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { formatPrice, ORDER_STATUS_CONFIG } from '@/lib/constants';

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { order, isLoading } = useOrder(id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Order Not Found
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          This order might have expired or doesn&apos;t exist.
        </p>
        <Link href="/menu" className="text-brand-500 hover:text-brand-600 text-sm font-bold">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: 'text-text-secondary', bgColor: 'bg-surface-700' };
  const showCode =
    order.collection_code &&
    ['confirmed', 'in_progress', 'ready'].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Order Status</h1>
          <p className="text-xs text-text-secondary font-mono">
            #{String(order.id || '').slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <Card className="text-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bgColor} ${statusConfig.color}`}
        >
          <Clock className="w-4 h-4" />
          {statusConfig.label}
        </div>
      </Card>

      {/* Collection Code */}
      {showCode && (
        <Card className="py-8">
          <CollectionCode code={order.collection_code!} />
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-5">
          Order Progress
        </h3>
        <OrderTimeline currentStatus={order.status} />
      </Card>

      {/* Order Items */}
      <Card>
        <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-3">
          Items Ordered
        </h3>
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0"
            >
              <div>
                <p className="text-sm font-bold text-text-primary">{item.item_name}</p>
                <p className="text-xs text-text-secondary">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-black text-brand-500">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-surface-700 pt-3 mt-3 flex justify-between">
          <span className="text-sm text-text-secondary">Total</span>
          <span className="text-base font-bold gradient-text">
            {formatPrice(order.total_amount)}
          </span>
        </div>
        {order.credits_used > 0 && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-emerald-600 font-bold">Credits Used</span>
            <span className="text-xs text-emerald-600 font-bold">
              -{formatPrice(order.credits_used)}
            </span>
          </div>
        )}
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-600 font-semibold leading-relaxed">
          <span className="font-black">Pick up within 10–15 minutes.</span> The canteen is not responsible for food quality if collected after this window.
        </p>
      </div>

      {/* Placed At */}
      <div className="text-center text-xs text-text-secondary">
        {mounted
          ? `Placed at ${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${new Date(order.created_at).toLocaleDateString()}`
          : '...'}
      </div>

      {/* Return CTA */}
      <div className="text-center pt-4">
        <Link href="/menu" className="text-sm text-brand-500 hover:text-brand-600 font-bold">
          ← Order something else
        </Link>
      </div>

    </div>
  );
}
