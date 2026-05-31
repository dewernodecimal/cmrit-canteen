'use client';

import Link from 'next/link';
import { ArrowRight, CreditCard, Package, Scan, ShoppingBag } from 'lucide-react';

import Button from '@/components/ui/Button';
import { useShopStatus } from '@/hooks/useShopStatus';

/**
 * Interactive steps workflow displaying how to use the canteen web application.
 * Each step highlights a key feature of the ordering and payment flow.
 */
const steps = [
  {
    icon: <Scan className="w-6 h-6" />,
    title: 'Scan',
    description: 'Find a Bites QR code around campus and scan it to open the menu.',
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: 'Pick',
    description: 'Browse the daily specials and add your favorites to the cart.',
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Pay',
    description: 'Use your Bites Credits for a 1-tap checkout. No more OTP hassles.',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Enjoy',
    description: 'Head to the counter, show your code, and enjoy your meal.',
  },
];


/**
 * HomePage Component
 * 
 * Renders the primary student-facing landing page for CMRIT Bites.
 * Features a live kitchen status badge, custom orders ticker, interactive
 * instructions steps, a support channel widget, and standard footer.
 */
export default function HomePage() {
  const { isActuallyOpen } = useShopStatus();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-600/8 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="text-center space-y-6 animate-slide-up">
            
            {/* 
              Live Transactions Volume Badge 
              Calculated from Supabase transactions log in Rupees (Total: ₹6,145.50 across:
              - payment_captured: ₹30.00 (online topups)
              - credit_issued: ₹3,505.50 (manually added)
              - credit_redeemed: ₹2,610.00 (spent on orders))
            */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl text-sm font-bold inline-flex items-center gap-2 mb-2 animate-pulse hover:scale-105 transition-transform duration-300">
              <span className="text-lg">💰</span> Over ₹6,145+ processed in transaction volume!
            </div>
            
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${
              isActuallyOpen 
                ? 'bg-brand-500/10 border-brand-500/20 text-brand-500' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isActuallyOpen ? 'bg-emerald-500 shadow-glow' : 'bg-rose-500'}`} />
              {isActuallyOpen ? 'Kitchen is Live' : 'Currently Closed'}
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-text-primary leading-[1.1] tracking-tight">
              Craving something? <br />
              <span className="gradient-text">CMRIT Bites.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              The fastest way to grab a meal. Skip the long lines at the counter. 
              Order, pay with <span className="text-brand-500 font-bold">Bites Credits</span>, and pick up in style.
            </p>



            {/* CTA */}
            <div className="flex justify-center pt-4">
              <Link href="/menu">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Browse Menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="glass rounded-[var(--radius-card)] p-6 text-center group 
                         hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 
                         transition-all duration-300"
            >
              {/* Step number */}
              <div className="text-xs font-mono text-brand-500/60 mb-3">
                0{idx + 1}
              </div>
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl gradient-brand mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/10 group-hover:shadow-brand-500/20 transition-shadow">
                <span className="text-white">{step.icon}</span>
              </div>
              {/* Text */}
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* Support Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-surface-800 border border-brand-500/20 rounded-[var(--radius-card)] p-8 text-center space-y-4 
                        shadow-xl shadow-brand-500/5 transition-all duration-300">
          <h2 className="text-xl font-bold text-text-primary">Need Help?</h2>
          <p className="text-text-secondary text-sm">
            Payment failed? Money deducted but no token? Don't worry! We've got your back.
          </p>
          <div className="pt-2">
            <a 
              href="https://wa.me/919148484559?text=Hi,%20I%20need%20help%20with%20my%20CMRIT%20Canteen%20order." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#25D366]/20 hover:scale-105 transition-transform"
            >
              WhatsApp Support
            </a>
          </div>
          {/* Support contact channel detail */}
          <p className="text-xs text-text-secondary/90 font-semibold mt-2">
            Support & Help • +91 9148484559
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-lg font-black text-text-primary/10 mb-4 tracking-widest uppercase">CMRIT Bites</h3>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
            Built for the CMRIT Community · © 2026
          </p>
        </div>
      </footer>


    </div>
  );
}




