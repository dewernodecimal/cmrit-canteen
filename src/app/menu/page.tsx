'use client';

import { Clock } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useHighDemand } from '@/hooks/useHighDemand';
import { useShopStatus } from '@/hooks/useShopStatus';
import MenuGrid from '@/components/menu/MenuGrid';

export default function MenuPage() {
  const { items, isLoading, error } = useMenu();
  const demandMap = useHighDemand();

  const { isActuallyOpen, status, isLoading: statusLoading } = useShopStatus();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Shop Status Banner */}
      {!isActuallyOpen && !statusLoading && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-text-primary uppercase tracking-tight">Canteen is Currently Closed</p>
              <p className="text-xs text-text-secondary font-medium">
                The canteen is currently not accepting new orders. Please check back later.
              </p>
            </div>
          </div>
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full">
            No New Orders
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
          Today&apos;s Menu
          {isActuallyOpen && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow" />}
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          Live stock · Prices in INR · Updated in real-time
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600 font-bold mb-6">
          {error}
        </div>
      )}


      {/* Menu Grid */}
      <MenuGrid items={items} isLoading={isLoading} demandMap={demandMap} isShopOpen={isActuallyOpen} />
    </div>
  );
}
