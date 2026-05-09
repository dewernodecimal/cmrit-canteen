'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Wallet, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { usePhone } from '@/contexts/PhoneContext';
import CartItem from '@/components/cart/CartItem';
import PhoneInput from '@/components/cart/PhoneInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/constants';

import Input from '@/components/ui/Input';

export default function CartPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { phone, setPhone, creditBalance } = usePhone();

  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const creditsToApply = Math.min(creditBalance, totalAmount);
  const amountToPay = totalAmount - creditsToApply;

  const handleCheckout = async () => {
    // Validate phone
    if (!/^\d{10}$/.test(phoneInput)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    setPhoneError('');
    
    // Validate credits
    if (amountToPay > 0) {
      setError('Insufficient credits. Please recharge your wallet at the counter.');
      return;
    }

    setPhone(phoneInput);

    if (items.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      // Create order on server
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput,
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

      // Order created successfully (either confirmed via credits or awaiting verification)
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
        <h2 className="text-xl font-semibold text-white mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Head to the menu and add some delicious items!
        </p>
        <Link href="/menu">
          <Button icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/menu"
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Checkout</h1>
      </div>

      {/* Cart Items */}
      <Card>
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Order Summary
        </h3>
        {items.map((item) => (
          <CartItem key={item.menuItem.id} item={item} />
        ))}
      </Card>

      {/* Phone Input */}
      <Card>
        <PhoneInput
          value={phoneInput}
          onChange={setPhoneInput}
          error={phoneError}
        />
      </Card>

      {/* Credits Info */}
      {creditBalance > 0 ? (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Canteen Credits
              </p>
              <p className="text-xs text-zinc-400">
                Available Balance: {formatPrice(creditBalance)}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                No Credits Available
              </p>
              <p className="text-xs text-rose-400/80">
                Please recharge your wallet at the canteen counter.
              </p>
            </div>
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
              {amountToPay > 0 ? 'Amount to Pay' : 'Total'}
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

      {/* Pay Button / Warning */}
      {amountToPay > 0 ? (
        <Card className="border-brand-500/30 text-center space-y-3">
          <p className="text-sm text-brand-400 font-medium">Insufficient Credits</p>
          <p className="text-xs text-zinc-400">
            You are short by {formatPrice(amountToPay)}. Visit the canteen counter and scan their QR code to recharge your account balance. 
            (1 Rupee = 1 Credit)
          </p>
        </Card>
      ) : (
        <Button
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          isLoading={isProcessing}
          icon={<ShieldCheck className="w-5 h-5" />}
        >
          Place Order (Deduct Credits)
        </Button>
      )}

      {/* Security note */}
      <p className="text-center text-[11px] text-zinc-600">
        Orders placed with credits are confirmed instantly.
      </p>
    </div>
  );
}
