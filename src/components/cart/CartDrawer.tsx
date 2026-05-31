'use client';

import { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import { useShopStatus } from '@/hooks/useShopStatus';
import CartItem from './CartItem';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/constants';
import AuthModal from '@/components/AuthModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, totalAmount, totalItems, clearCart } = useCart();
  const { phone, creditBalance, isLoggedIn, refreshCredits } = usePhone();
  const { isActuallyOpen } = useShopStatus();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  const amountToPay = totalAmount - Math.min(creditBalance, totalAmount);
  const hasSufficientBalance = amountToPay <= 0;

  const handleCheckout = async () => {
    if (!isActuallyOpen) {
      setError('The canteen is currently closed.');
      return;
    }
    if (!isLoggedIn || !phone) {
      setAuthOpen(true);
      return;
    }
    if (!hasSufficientBalance) {
      setError('Insufficient credits. Please top up your wallet.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          items: items.map((i) => ({
            menu_item_id: i.menuItem.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      try {
        const topic = process.env.NEXT_PUBLIC_NTFY_TOPIC || 'cmritcanteen';
        const host = window.location.host;
        const protocol = window.location.protocol;
        const clickUrl = `${protocol}//${host}/staff`;
        
        await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: `\ud83c\udf7d\ufe0f New Order Received!\nItems: ${data.items_summary}\nTotal: \u20b9${data.total_amount}\nCollection Code: ${data.collection_code}`,
          headers: {
            'Title': 'New Order Received!',
            'Priority': 'high',
            'Tags': 'tada,shopping_cart,bell',
            'Click': clickUrl,
          },
        });
      } catch (err) {
        console.error('Client ntfy push failed:', err);
      }

      await refreshCredits();
      clearCart();
      setIsProcessing(false);
      onClose();
      router.push(`/order/${data.order_id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md z-50
          bg-slate-950 border-l border-slate-800 shadow-2xl
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Your Order
              {totalItems > 0 && (
                <span className="text-sm text-zinc-400 font-bold ml-2">
                  ({totalItems})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div className="relative w-40 h-40 mb-6 opacity-40 grayscale">
                <img 
                  src="/empty_cart_illustration_1778389808753.png" 
                  alt="Empty Cart" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-white font-bold text-xl tracking-tight">Your cart is empty</p>
              <p className="text-zinc-500 text-sm mt-2 font-medium">
                Add some delicious treats to get started!
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-6 font-bold"
                onClick={onClose}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="py-2 divide-y divide-slate-800/50">
              {items.map((item) => (
                <CartItem key={item.menuItem.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-6 space-y-5 bg-slate-900">
            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500 text-center">
                {error}
              </div>
            )}

            {/* Total Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 font-bold">Item Total</span>
                <span className="text-white font-bold">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-3">
                <span className="text-zinc-400 font-black uppercase tracking-widest text-xs">To Pay</span>
                <span className="text-2xl font-black text-white">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Wallet Status & Action */}
            <div className="flex flex-col gap-3 pt-2">
              {!isLoggedIn ? (
                <Button size="lg" className="w-full shadow-2xl" onClick={() => setAuthOpen(true)}>
                  Login to Checkout
                </Button>
              ) : !hasSufficientBalance ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-rose-500">Wallet Balance</span>
                    </div>
                    <span className="text-xs font-black text-rose-500">{formatPrice(creditBalance)}</span>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full opacity-50 cursor-not-allowed" 
                    disabled 
                    icon={<ShieldCheck className="w-5 h-5" />}
                  >
                    Insufficient Balance
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500">Wallet Balance</span>
                    </div>
                    <span className="text-xs font-black text-emerald-500">{formatPrice(creditBalance)}</span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full shadow-2xl shadow-emerald-500/20"
                    onClick={handleCheckout}
                    isLoading={isProcessing}
                    disabled={!isActuallyOpen || isProcessing}
                    icon={<ShieldCheck className="w-5 h-5" />}
                  >
                    {isActuallyOpen ? 'Pay with Wallet' : 'Canteen Closed'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
