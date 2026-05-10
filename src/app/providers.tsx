'use client';

import { PhoneProvider } from '@/contexts/PhoneContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import FloatingCart from '@/components/cart/FloatingCart';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PhoneProvider>
        <CartProvider>
          <Navbar />
          <main className="flex-1 pb-24">{children}</main>
          <FloatingCart />
        </CartProvider>
      </PhoneProvider>
    </ThemeProvider>
  );
}


