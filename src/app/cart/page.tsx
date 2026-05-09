'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, ShieldCheck, LogIn, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import CartItem from '@/components/cart/CartItem';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/constants';
import AuthModal from '@/components/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { phone, creditBalance, isLoggedIn, refreshCredits } = usePhone();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  const creditsToApply = Math.min(creditBalance, totalAmount);
  const amountToPay = totalAmount - creditsToApply;

  const handleCheckout = async () => {
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
        <p className="text-sm text-zinc-400 mb-6">Head to the menu and add some delicious items!</p>
        <Link href="/menu">
          <Button icon={<ArrowLeft className="w-4 h-4" />}>Back to Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/menu" className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Checkout</h1>
      </div>

      {/* Cart Items */}
      <Card>
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Order Summary</h3>
        {items.map((item) => (
          <CartItem key={item.menuItem.id} item={item} />
        ))}
      </Card>

      {/* Auth / Wallet State */}
      {!isLoggedIn ? (
        <Card className="border-brand-500/20 bg-brand-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-400/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Login to pay with credits</p>
              <p className="text-xs text-zinc-400">You need an account to place an order.</p>
            </div>
            <Button size="sm" onClick={() => setAuthOpen(true)}>Login</Button>
          </div>
        </Card>
      ) : creditBalance > 0 ? (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Canteen Credits</p>
                <p className="text-xs text-zinc-400">Available: {formatPrice(creditBalance)}</p>
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
        <Card className="border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">No Credits</p>
                <p className="text-xs text-rose-400/80">Visit the counter to top up your wallet.</p>
              </div>
            </div>
            <Link href="/wallet">
              <Button size="sm" variant="secondary" icon={<PlusCircle className="w-3.5 h-3.5" />}>Top Up</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Price Breakdown */}
      <Card>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          {creditsToApply > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Credits Applied</span>
              <span>-{formatPrice(creditsToApply)}</span>
            </div>
          )}
          <div className="border-t border-white/5 pt-3 flex justify-between">
            <span className="text-base font-semibold text-white">
              {amountToPay > 0 ? 'Still Need' : 'Total'}
            </span>
            <span className="text-xl font-bold gradient-text">
              {amountToPay > 0 ? formatPrice(amountToPay) : 'FREE ✨'}
            </span>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-400/10 border border-rose-400/20 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Action */}
      {!isLoggedIn ? (
        <Button size="lg" className="w-full" onClick={() => setAuthOpen(true)} icon={<LogIn className="w-5 h-5" />}>
          Login to Place Order
        </Button>
      ) : amountToPay > 0 ? (
        <Card className="border-brand-500/30 text-center space-y-2">
          <p className="text-sm text-brand-400 font-medium">Insufficient Credits</p>
          <p className="text-xs text-zinc-400">
            You are short by {formatPrice(amountToPay)}. Visit the canteen counter to top up. (1 Rupee = 1 Credit)
          </p>
          <Link href="/wallet" className="block">
            <Button size="sm" className="mx-auto" icon={<PlusCircle className="w-4 h-4" />}>View Wallet</Button>
          </Link>
        </Card>
      ) : (
        <Button
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          isLoading={isProcessing}
          icon={<ShieldCheck className="w-5 h-5" />}
        >
          Place Order (Deduct {formatPrice(creditsToApply)})
        </Button>
      )}

      <p className="text-center text-[11px] text-zinc-600">
        Orders placed with credits are confirmed instantly.
      </p>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
