'use client';

import { PhoneProvider } from '@/contexts/PhoneContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import FloatingCart from '@/components/cart/FloatingCart';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PhoneProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-1 pb-36 md:pb-24">{children}</main>
        <FloatingCart />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface-800)',
              color: 'var(--text-primary)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-elevated)',
              border: '1px solid rgba(0,0,0,0.05)',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
            },
          }}
        />
      </CartProvider>
    </PhoneProvider>
  );
}


