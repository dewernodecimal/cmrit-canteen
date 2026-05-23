'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, ShieldCheck, LogIn, PlusCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import { useShopStatus } from '@/hooks/useShopStatus';
import CartItem from '@/components/cart/CartItem';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/constants';
import AuthModal from '@/components/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { phone, creditBalance, isLoggedIn, refreshCredits } = usePhone();
  const { isActuallyOpen, status } = useShopStatus();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  const creditsToApply = Math.min(creditBalance, totalAmount);
  const amountToPay = totalAmount - creditsToApply;

  const handleCheckout = async () => {
    if (!isActuallyOpen) {
      setError('The canteen is currently closed and not accepting new orders.');
      return;
    }
    if (!isLoggedIn || !phone) {
      setAuthOpen(true);
      return;
    }
    if (amountToPay > 0) {
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

      // Send push notification from the client to bypass Vercel server IP limits
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
      router.push(`/order/${data.order_id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full" />
          <img 
            src="/empty_cart_illustration_1778389808753.png" 
            alt="Empty Cart" 
            className="relative w-full h-full object-contain opacity-80"
          />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Your cart is empty</h2>
        <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
          Head back to the menu to discover something delicious. Your cravings are waiting!
        </p>
        <Link href="/menu">
          <Button size="lg" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Menu
          </Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/menu" className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Checkout</h1>
        </div>
        <div className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
          <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Bites Pay</span>
        </div>
      </div>

      {/* Cart Items */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-surface-800 border-b border-surface-700">
          <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">Your Order</h3>
        </div>
        <div className="p-2">
          {items.map((item) => (
            <CartItem key={item.menuItem.id} item={item} />
          ))}
        </div>
      </Card>

      {/* Auth / Wallet State */}
      {!isLoggedIn ? (
        <Card className="border-brand-500/20 bg-brand-500/5 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-text-primary">Unlock Bites Credits</p>
              <p className="text-xs text-text-secondary">Login to use your secure digital wallet.</p>
            </div>
            <Button size="sm" onClick={() => setAuthOpen(true)}>Login</Button>
          </div>
        </Card>
      ) : creditBalance > 0 ? (
        <Card className="p-5 border-emerald-500/20 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">Bites Credits</p>
                <p className="text-xs text-emerald-600 font-bold">Balance: {formatPrice(creditBalance)}</p>
              </div>
            </div>
            {amountToPay > 0 && (
              <Link href="/wallet">
                <Button size="sm" variant="secondary" icon={<PlusCircle className="w-3.5 h-3.5" />}>Top Up</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-5 border-rose-500/20 bg-rose-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">Empty Wallet</p>
                <p className="text-xs text-rose-600 font-bold">Visit counter to add credits.</p>
              </div>
            </div>
            <Link href="/wallet">
              <Button size="sm" variant="secondary" icon={<PlusCircle className="w-3.5 h-3.5" />}>Top Up</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Price Breakdown */}
      <Card className="p-6">
        <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4">Bill Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-text-secondary font-bold">
            <span>Item Total</span>
            <span className="text-text-primary">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary font-bold">
            <span>Handling Fee</span>
            <span className="text-emerald-600">FREE</span>
          </div>
          {creditsToApply > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Bites Credits Applied</span>
              <span>-{formatPrice(creditsToApply)}</span>
            </div>
          )}
          <div className="border-t border-surface-700 pt-4 flex justify-between items-end">
            <div>
              <span className="text-xs font-black text-text-secondary uppercase tracking-widest block mb-1">To Pay</span>
              <span className="text-2xl font-black text-text-primary">
                {amountToPay > 0 ? formatPrice(amountToPay) : 'FULLY PAID'}
              </span>
            </div>
            {amountToPay === 0 && (
              <div className="px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-lg">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Instant Confirmation</span>
              </div>
            )}
          </div>
        </div>
      </Card>


      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600 font-bold">
          {error}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-600 font-semibold leading-relaxed">
          <span className="font-black">Pick up within 10–15 minutes of ordering.</span> The canteen is not responsible for food quality if collected after this window.
        </p>
      </div>

      {/* Action */}
      {!isLoggedIn ? (
        <Button size="lg" className="w-full" onClick={() => setAuthOpen(true)} icon={<LogIn className="w-5 h-5" />}>
          Login to Place Order
        </Button>
      ) : amountToPay > 0 ? (
        <Card className="border-brand-500/20 text-center bg-brand-50/50 space-y-2 p-6">
          <p className="text-sm text-brand-600 font-black uppercase tracking-tight">Insufficient Credits</p>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            You are short by <span className="text-text-primary font-bold">{formatPrice(amountToPay)}</span>. Visit the canteen counter to top up. (1 Rupee = 1 Credit)
          </p>
          <div className="pt-2">
            <Link href="/wallet" className="inline-block">
              <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>View Wallet</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Button
          size="lg"
          className="w-full shadow-2xl shadow-brand-500/30"
          onClick={handleCheckout}
          isLoading={isProcessing}
          disabled={!isActuallyOpen}
          icon={<ShieldCheck className="w-5 h-5" />}
        >
          {isActuallyOpen ? `Place Order (Deduct ${formatPrice(creditsToApply)})` : 'Canteen Closed'}
        </Button>
      )}

      <p className="text-center text-[10px] text-text-secondary font-bold uppercase tracking-widest">
        Orders placed with credits are confirmed instantly.
      </p>


      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
