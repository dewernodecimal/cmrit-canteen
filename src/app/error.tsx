'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-800 rounded-3xl border border-surface-700 p-10 text-center animate-slide-up shadow-2xl shadow-surface-900/10">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
          <AlertTriangle className="w-10 h-10 text-rose-600" />
        </div>
        
        <h2 className="text-3xl font-black text-text-primary mb-3 tracking-tight">Oops! Something went wrong</h2>
        <p className="text-text-secondary text-sm mb-10 font-medium">
          We encountered an unexpected error. Don't worry, your cart and session are still safe.
        </p>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => reset()} 
            size="lg" 
            className="w-full shadow-lg shadow-brand-500/20"
            icon={<RefreshCcw className="w-5 h-5" />}
          >
            Try Again
          </Button>
          
          <Link href="/" className="block">
            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full text-text-secondary font-bold"
              icon={<Home className="w-5 h-5" />}
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-50">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>

  );
}
