'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  RefreshCw,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPrice, CATEGORY_CONFIG } from '@/lib/constants';
import type { MenuItem } from '@/types';

export default function InventoryPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [staffPin, setStaffPin] = useState('');

  useEffect(() => {
    setStaffPin(sessionStorage.getItem('staff_pin') || '');
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-pin': staffPin,
        },
        body: JSON.stringify({ id, ...updates }),
      });
      fetchItems();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const resetAllStock = async () => {
    if (!confirm('Reset ALL items to their daily stock cap?')) return;
    setResetting(true);
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-pin': staffPin,
        },
        body: JSON.stringify({ action: 'reset_stock' }),
      });
      fetchItems();
    } catch (err) {
      console.error('Failed to reset stock:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Inventory</h1>
          <p className="text-sm text-text-secondary mt-0.5 font-medium">
            Manage stock levels and availability
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="font-bold"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchItems}
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="font-bold"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={resetAllStock}
            isLoading={resetting}
          >
            Reset All Stock
          </Button>
        </div>
      </div>

      {/* Inventory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => {
          const stockPercent = (item.current_stock / item.daily_stock_cap) * 100;
          const isLow = stockPercent <= 20;
          const isOut = item.current_stock <= 0 || !item.is_available;

          return (
            <Card key={item.id} padding="sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate uppercase tracking-tight">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary font-medium">
                      {CATEGORY_CONFIG[item.category]?.emoji}{' '}
                      {CATEGORY_CONFIG[item.category]?.label}
                    </span>
                    <span className="text-xs text-text-secondary">·</span>
                    <span className="text-xs text-brand-600 font-bold">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>

                {/* Toggle availability */}
                <button
                  onClick={() =>
                    updateItem(item.id, { is_available: !item.is_available })
                  }
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    item.is_available
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                  title={item.is_available ? 'Hide item' : 'Show item'}
                >
                  {item.is_available ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Stock bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-text-secondary">Stock Status</span>
                  <span
                    className={
                      isOut
                        ? 'text-rose-600'
                        : isLow
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }
                  >
                    {item.current_stock} / {item.daily_stock_cap}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOut
                        ? 'bg-rose-500'
                        : isLow
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(stockPercent, 0)}%` }}
                  />
                </div>
              </div>

              {/* Quick stock adjust */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() =>
                    updateItem(item.id, {
                      current_stock: Math.max(0, item.current_stock - 10),
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-surface-700 text-text-secondary text-xs font-bold hover:bg-surface-600 hover:text-text-primary transition-colors cursor-pointer"
                >
                  -10
                </button>
                <button
                  onClick={() =>
                    updateItem(item.id, {
                      current_stock: Math.max(0, item.current_stock - 1),
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-surface-700 text-text-secondary text-xs font-bold hover:bg-surface-600 hover:text-text-primary transition-colors cursor-pointer"
                >
                  -1
                </button>
                <div className="flex-1" />
                <button
                  onClick={() =>
                    updateItem(item.id, {
                      current_stock: Math.min(
                        item.daily_stock_cap,
                        item.current_stock + 1
                      ),
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-surface-700 text-text-secondary text-xs font-bold hover:bg-surface-600 hover:text-text-primary transition-colors cursor-pointer"
                >
                  +1
                </button>
                <button
                  onClick={() =>
                    updateItem(item.id, {
                      current_stock: Math.min(
                        item.daily_stock_cap,
                        item.current_stock + 10
                      ),
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-surface-700 text-text-secondary text-xs font-bold hover:bg-surface-600 hover:text-text-primary transition-colors cursor-pointer"
                >
                  +10
                </button>
                <button
                  onClick={() =>
                    updateItem(item.id, {
                      current_stock: item.daily_stock_cap,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-brand-500 text-white text-xs font-black uppercase tracking-tighter hover:bg-brand-600 transition-colors cursor-pointer shadow-lg shadow-brand-500/10"
                  title="Reset to daily cap"
                >
                  Max
                </button>
              </div>

            </Card>
          );
        })}
      </div>
    </div>
  );
}
