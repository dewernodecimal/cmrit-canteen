import { ORDER_STATUS_CONFIG } from '@/lib/constants';
import type { OrderStatus } from '@/types';
import { Clock, ChefHat, Package, CheckCircle2, XCircle, CreditCard } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const steps: { status: OrderStatus; icon: React.ReactNode; label: string }[] = [
  { status: 'awaiting_verification', icon: <CreditCard className="w-4 h-4" />, label: 'Verifying' },
  { status: 'confirmed', icon: <Clock className="w-4 h-4" />, label: 'Confirmed' },
  { status: 'in_progress', icon: <ChefHat className="w-4 h-4" />, label: 'Preparing' },
  { status: 'ready', icon: <Package className="w-4 h-4" />, label: 'Ready' },
  { status: 'completed', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Collected' },
];

const statusOrder: OrderStatus[] = [
  'awaiting_verification',
  'confirmed',
  'in_progress',
  'ready',
  'completed',
];

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100">
        <XCircle className="w-6 h-6 text-rose-600" />
        <div>
          <p className="text-sm font-bold text-rose-600">Order Cancelled</p>
          <p className="text-xs text-rose-600/70 mt-0.5 font-medium">
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
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-500 shadow-sm
                  ${isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : ''}
                  ${isCurrent ? 'bg-brand-500 text-white animate-pulse-glow shadow-brand-500/20' : ''}
                  ${isPending ? 'bg-surface-700 text-text-secondary' : ''}
                `}
              >
                {step.icon}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${
                  isCurrent ? 'text-brand-600' : isCompleted ? 'text-emerald-600' : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div className="flex-1 mx-1 px-1">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-surface-700'
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
