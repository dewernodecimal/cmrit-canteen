'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/constants';

interface Transaction {
  id: string;
  phone: string;
  type: 'credit_issued' | 'credit_redeemed' | 'payment_captured' | 'refund';
  amount: number;
  note: string | null;
  created_at: string;
  order_id: string | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [staffPin, setStaffPin] = useState('');

  useEffect(() => {
    setStaffPin(sessionStorage.getItem('staff_pin') || '');
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!staffPin) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/staff/transactions', {
        headers: { 'x-staff-pin': staffPin },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [staffPin]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getTransactionIcon = (type: Transaction['type']) => {
    if (type === 'credit_issued' || type === 'refund') {
      return <PlusCircle className="w-5 h-5 text-emerald-500" />;
    }
    return <MinusCircle className="w-5 h-5 text-rose-500" />;
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'credit_issued': return 'Wallet Top-up / Refund';
      case 'credit_redeemed': return 'Credits Used for Order';
      case 'payment_captured': return 'Payment Captured';
      case 'refund': return 'Refund';
      default: return 'Transaction';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Transaction History</h1>
          <p className="text-sm text-text-secondary mt-0.5 font-medium">
            Recent top-ups and order payments
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="font-bold"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchTransactions}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading && transactions.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-24 bg-surface-800 rounded-3xl border border-surface-700">
            <FileText className="w-20 h-20 text-surface-600 mx-auto mb-6" />
            <p className="text-text-primary font-bold text-xl">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-800 text-text-secondary text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Date & Time</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Note / Order ID</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {transactions.map((txn) => {
                  const isPositive = txn.type === 'credit_issued' || txn.type === 'refund';
                  return (
                    <tr key={txn.id} className="hover:bg-surface-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">
                        {new Date(txn.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-text-primary">
                        {txn.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(txn.type)}
                          <span className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {getTransactionLabel(txn.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {txn.note || (txn.order_id ? `Order #${txn.order_id.slice(0, 8)}` : '-')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-black ${isPositive ? 'text-emerald-500' : 'text-text-primary'}`}>
                        {isPositive ? '+' : '-'}{formatPrice(txn.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
