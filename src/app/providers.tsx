'use client';

import { PhoneProvider } from '@/contexts/PhoneContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import FloatingCart from '@/components/cart/FloatingCart';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PhoneProvider>
      <CartProvider>
        <Navbar />
        <main className="flex-1 pb-24">{children}</main>
        <FloatingCart />
      </CartProvider>
    </PhoneProvider>
  );
}


