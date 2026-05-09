'use client';

import { use } from 'react';
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
        <h2 className="text-xl font-semibold text-white mb-2">
          Order Not Found
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          This order might have expired or doesn&apos;t exist.
        </p>
        <Link href="/menu" className="text-brand-400 hover:text-brand-300 text-sm">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const showCode =
    order.collection_code &&
    ['confirmed', 'in_progress', 'ready'].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/menu"
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Order Status</h1>
          <p className="text-xs text-zinc-500 font-mono">
            #{order.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <Card className="text-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConfig?.bgColor} ${statusConfig?.color}`}
        >
          <Clock className="w-4 h-4" />
          {statusConfig?.label}
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
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5">
          Order Progress
        </h3>
        <OrderTimeline currentStatus={order.status} />
      </Card>

      {/* Order Items */}
      <Card>
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Items Ordered
        </h3>
        <div className="space-y-3">
          {order.order_items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.item_name}</p>
                <p className="text-xs text-zinc-500">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-400">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-white/5 pt-3 mt-3 flex justify-between">
          <span className="text-sm text-zinc-400">Total</span>
          <span className="text-base font-bold gradient-text">
            {formatPrice(order.total_amount)}
          </span>
        </div>
        {order.credits_used > 0 && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-emerald-400">Credits Used</span>
            <span className="text-xs text-emerald-400">
              -{formatPrice(order.credits_used)}
            </span>
          </div>
        )}
      </Card>

      {/* Return CTA */}
      <div className="text-center pt-4">
        <Link href="/menu" className="text-sm text-brand-400 hover:text-brand-300">
          ← Order something else
        </Link>
      </div>
    </div>
  );
}
