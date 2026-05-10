'use client';

import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalAmount, totalItems, clearCart } = useCart();
  const router = useRouter();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md z-50
          bg-surface-800 border-l border-white/5 shadow-2xl
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold text-white">
              Your Cart
              {totalItems > 0 && (
                <span className="text-sm text-zinc-400 font-normal ml-2">
                  ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
              <div className="relative w-48 h-48 mb-6">
                <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full" />
                <img 
                  src="/empty_cart_illustration_1778389808753.png" 
                  alt="Empty Cart" 
                  className="relative w-full h-full object-contain opacity-80"
                />
              </div>
              <p className="text-white font-semibold text-lg">Your cart is feeling lonely</p>
              <p className="text-zinc-500 text-sm mt-2 max-w-[240px]">
                Explore our menu and add some delicious treats to get started!
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-6"
                onClick={onClose}
              >
                Start Browsing
              </Button>
            </div>
          ) : (

            <div className="py-2">
              {items.map((item) => (
                <CartItem key={item.menuItem.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 px-5 py-4 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Subtotal</span>
              <span className="text-xl font-bold gradient-text">
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-zinc-500"
              >
                Clear
              </Button>
              <Button
                size="lg"
                className="flex-1"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  onClose();
                  router.push('/cart');
                }}
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
