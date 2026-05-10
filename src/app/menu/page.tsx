'use client';

import { useMenu } from '@/hooks/useMenu';
import { useHighDemand } from '@/hooks/useHighDemand';
import MenuGrid from '@/components/menu/MenuGrid';

export default function MenuPage() {
  const { items, isLoading, error } = useMenu();
  const demandMap = useHighDemand();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Today&apos;s Menu
        </h1>
        <p className="text-sm text-text-secondary mt-1">
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
      <MenuGrid items={items} isLoading={isLoading} demandMap={demandMap} />
    </div>
  );
}
