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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { phone, setPhone, creditBalance } = usePhone();

  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [useCredits, setUseCredits] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const creditsToApply = useCredits
    ? Math.min(creditBalance, totalAmount)
    : 0;
  const amountToPay = totalAmount - creditsToApply;

  const handleCheckout = async () => {
    // Validate phone
    if (!/^\d{10}$/.test(phoneInput)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    setPhoneError('');
    setPhone(phoneInput);

    if (items.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      // 1. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput,
          items: items.map((i) => ({
            menu_item_id: i.menuItem.id,
            quantity: i.quantity,
          })),
          use_credits: useCredits,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // 2. If amount is 0 (fully covered by credits), order is auto-confirmed
      if (data.amount_to_pay === 0) {
        clearCart();
        router.push(`/order/${data.order_id}`);
        return;
      }

      // 3. Open Razorpay checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: data.key_id,
          amount: data.amount_to_pay,
          currency: 'INR',
          name: 'CMRIT Canteen',
          description: `Order - ${items.length} items`,
          order_id: data.razorpay_order_id,
          handler: function () {
            // Payment success — webhook will confirm server-side
            clearCart();
            router.push(`/order/${data.order_id}`);
          },
          prefill: {
            contact: `+91${phoneInput}`,
          },
          theme: {
            color: '#f97316',
            backdrop_color: 'rgba(0,0,0,0.7)',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
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

      {/* Credits Toggle */}
      {creditBalance > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Use Canteen Credits
                </p>
                <p className="text-xs text-zinc-400">
                  Balance: {formatPrice(creditBalance)}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useCredits}
                onChange={(e) => setUseCredits(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-600 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 transition-colors">
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform mt-0.5
                    ${useCredits ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`}
                />
              </div>
            </label>
          </div>
          {useCredits && creditsToApply > 0 && (
            <p className="text-xs text-emerald-400 mt-3 pl-13">
              {formatPrice(creditsToApply)} credits will be applied
            </p>
          )}
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

      {/* Pay Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        isLoading={isProcessing}
        icon={
          amountToPay > 0 ? (
            <CreditCard className="w-5 h-5" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )
        }
      >
        {amountToPay > 0
          ? `Pay ${formatPrice(amountToPay)}`
          : 'Place Order (Credits)'}
      </Button>

      {/* Security note */}
      <p className="text-center text-[11px] text-zinc-600 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Payments secured by Razorpay. We never store card details.
      </p>
    </div>
  );
}
