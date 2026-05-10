'use client';

import Link from 'next/link';
import { ArrowRight, Scan, ShoppingBag, CreditCard, Package } from 'lucide-react';
import Button from '@/components/ui/Button';

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


export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-600/8 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="text-center space-y-6 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-sm text-brand-500 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kitchen is Live
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
              className="glass rounded-[var(--radius-card)] p-6 text-center group hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300"
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
