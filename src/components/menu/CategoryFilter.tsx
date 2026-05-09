'use client';

import { CATEGORY_CONFIG } from '@/lib/constants';
import type { ItemCategory } from '@/types';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const categories = Object.entries(CATEGORY_CONFIG) as [string, { label: string; emoji: string }][];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
      {categories.map(([key, { label, emoji }]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0
            ${
              selected === key
                ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
                : 'glass-light text-zinc-400 hover:text-white hover:bg-surface-600'
            }
          `}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
