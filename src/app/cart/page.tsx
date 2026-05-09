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
  const [useCredits, setUseCredits] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

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
    
    // Validate UTR if payment is required
    if (amountToPay > 0) {
      if (!utrNumber || utrNumber.length !== 12 || !/^\d+$/.test(utrNumber)) {
        setUtrError('Please enter a valid 12-digit UPI Reference Number (UTR)');
        return;
      }
    }
    setUtrError('');
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
          use_credits: useCredits,
          utr_number: amountToPay > 0 ? utrNumber : undefined,
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

      {/* UTR Payment Details */}
      {amountToPay > 0 && (
        <Card className="border-brand-500/30">
          <div className="mb-6 text-center space-y-4">
            <h3 className="text-lg font-semibold text-white">Payment Details</h3>
            
            {/* Dynamic QR Code */}
            <div className="flex justify-center bg-white p-3 rounded-xl w-48 mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=vedantgurav2718@okhdfcbank&pn=CMRIT%20Canteen&am=${(amountToPay / 100).toFixed(2)}&cu=INR`)}`} 
                alt="UPI QR Code" 
                className="w-full h-full"
              />
            </div>
            
            <p className="text-xs text-zinc-400">
              Scan QR code from any device, or tap the button below if paying from this phone.
            </p>

            <a 
              href={`upi://pay?pa=vedantgurav2718@okhdfcbank&pn=CMRIT%20Canteen&am=${(amountToPay / 100).toFixed(2)}&cu=INR`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium hover:bg-emerald-500/20 transition-colors"
            >
              📱 Tap to Pay {formatPrice(amountToPay)} via UPI App
            </a>
          </div>

          <div className="border-t border-white/10 pt-5 mb-1">
            <h4 className="text-sm font-medium text-white mb-2">Step 2: Enter UTR Number</h4>
            <p className="text-xs text-zinc-400 mb-3">
              After successful payment, enter the 12-digit UTR/Reference number from your app.
            </p>
            <Input
              placeholder="e.g. 312456789012"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              error={utrError}
              maxLength={12}
            />
          </div>
        </Card>
      )}

      {/* Pay Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        isLoading={isProcessing}
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        {amountToPay > 0
          ? `Submit Order for Verification`
          : 'Place Order (Credits)'}
      </Button>

      {/* Security note */}
      <p className="text-center text-[11px] text-zinc-600">
        Orders are processed after staff verifies your UPI payment.
      </p>
    </div>
  );
}
