'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import MenuCard from './MenuCard';
import CategoryFilter from './CategoryFilter';
import { MenuCardSkeleton } from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import type { MenuItem } from '@/types';

interface MenuGridProps {
  items: MenuItem[];
  isLoading?: boolean;
  demandMap?: Record<string, number>;
}

export default function MenuGrid({ items, isLoading = false, demandMap = {} }: MenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<MenuItem[]>(items);

  useEffect(() => {
    let result = items;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    // Sort: available first, then by name
    result.sort((a, b) => {
      if (a.is_available && !b.is_available) return -1;
      if (!a.is_available && b.is_available) return 1;
      if (a.current_stock > 0 && b.current_stock <= 0) return -1;
      if (a.current_stock <= 0 && b.current_stock > 0) return 1;
      return a.name.localeCompare(b.name);
    });

    setFiltered(result);
  }, [items, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-shimmer h-10 w-24 rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {[...Array(6)].map((_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <Input
        placeholder="Search for samosa, coffee, biryani..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

      {/* Category filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-zinc-400 text-sm">
            {searchQuery ? 'No items match your search' : 'No items in this category'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filtered.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              demandCount={demandMap[item.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
