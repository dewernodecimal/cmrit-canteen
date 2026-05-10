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
            flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold
            whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 border
            ${
              selected === key
                ? 'gradient-brand text-white border-transparent shadow-xl shadow-brand-500/30 scale-105'
                : 'bg-surface-800 text-zinc-400 border-white/5 hover:border-brand-500/30 hover:text-white'
            }
          `}
        >
          <span className="text-base">{emoji}</span>
          <span>{label}</span>
        </button>

      ))}
    </div>
  );
}
