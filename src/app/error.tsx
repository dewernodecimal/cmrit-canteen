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
      <div className="max-w-md w-full glass rounded-2xl border border-rose-500/10 p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-8">
          We encountered an unexpected error. Don't worry, your cart and session should still be safe.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()} 
            size="lg" 
            className="w-full"
            icon={<RefreshCcw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          
          <Link href="/" className="block">
            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full"
              icon={<Home className="w-4 h-4" />}
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[10px] text-zinc-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
