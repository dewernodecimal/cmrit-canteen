'use client';

import { Wallet, ArrowLeft, QrCode, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { usePhone } from '@/contexts/PhoneContext';
import { formatPrice } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export default function WalletPage() {
  const { phone, creditBalance, isLoggedIn, refreshCredits } = usePhone();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (phone) {
      fetchTransactions();
    }
  }, [phone]);

  const fetchTransactions = async () => {
    if (!phone) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/credits?phone=${phone}&history=true`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        await refreshCredits();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn || !phone) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Wallet className="w-16 h-16 text-text-secondary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Login to view your wallet</h2>
        <p className="text-sm text-text-secondary mb-6">
          You need to be logged in to see your credits and transaction history.
        </p>
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
        <Link href="/menu" className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">My Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-xl p-6 bg-emerald-500 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <p className="text-sm font-medium text-white/80 mb-1">Available Balance</p>
        <p className="text-4xl font-bold text-white mb-3">{formatPrice(creditBalance)}</p>
        <p className="text-xs text-white/60">Phone: {phone}</p>
      </div>

      {/* How to recharge */}
      <Card className="border-emerald-500/20">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-500" />
          How to Add Credits
        </h3>
        <ol className="space-y-2.5 text-sm text-text-secondary">
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold flex-shrink-0">01</span>
            <span>Walk up to the canteen counter.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold flex-shrink-0">02</span>
            <span>Tell the staff your phone number and how much you want to add.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold flex-shrink-0">03</span>
            <span>Pay cash or scan the canteen's QR code. <strong className="text-text-primary">1 Rupee = 1 Credit.</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold flex-shrink-0">04</span>
            <span>The staff adds it instantly to your account. Credits appear here immediately.</span>
          </li>
        </ol>
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-600">
            Once you have credits, you can order anything from the menu and pay instantly — no UPI or cash at the counter!
          </p>
        </div>
      </Card>

      {/* Transaction History */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Transaction History</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg animate-shimmer" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((txn: any) => (
              <div
                key={txn.id}
                className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0"
              >
                <div>
                  <p className="text-sm text-text-primary capitalize">{txn.note || txn.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-text-secondary">{new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-sm font-semibold ${txn.type === 'credit_issued' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {txn.type === 'credit_issued' ? '+' : '-'}{formatPrice(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
