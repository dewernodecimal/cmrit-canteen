'use client';

import { PhoneProvider } from '@/contexts/PhoneContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PhoneProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
      </CartProvider>
    </PhoneProvider>
  );
}
