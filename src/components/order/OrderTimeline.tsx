import { ORDER_STATUS_CONFIG } from '@/lib/constants';
import type { OrderStatus } from '@/types';
import { Clock, ChefHat, Package, CheckCircle2, XCircle, CreditCard } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const steps: { status: OrderStatus; icon: React.ReactNode; label: string }[] = [
  { status: 'pending_payment', icon: <CreditCard className="w-4 h-4" />, label: 'Payment' },
  { status: 'confirmed', icon: <Clock className="w-4 h-4" />, label: 'Confirmed' },
  { status: 'in_progress', icon: <ChefHat className="w-4 h-4" />, label: 'Preparing' },
  { status: 'ready', icon: <Package className="w-4 h-4" />, label: 'Ready' },
  { status: 'completed', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Collected' },
];

const statusOrder: OrderStatus[] = [
  'pending_payment',
  'confirmed',
  'in_progress',
  'ready',
  'completed',
];

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-400/10 border border-rose-400/20">
        <XCircle className="w-6 h-6 text-rose-400" />
        <div>
          <p className="text-sm font-medium text-rose-400">Order Cancelled</p>
          <p className="text-xs text-rose-400/60 mt-0.5">
            Credits have been added to your account
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                  ${isCurrent ? 'gradient-brand text-white animate-pulse-glow' : ''}
                  ${isPending ? 'bg-surface-600 text-zinc-500' : ''}
                `}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isCurrent ? 'text-brand-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div className="flex-1 mx-1.5">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-surface-600'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
