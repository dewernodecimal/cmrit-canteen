'use client';

import Link from 'next/link';
import { ArrowRight, Scan, ShoppingBag, CreditCard, Package } from 'lucide-react';
import Button from '@/components/ui/Button';

const steps = [
  {
    icon: <Scan className="w-6 h-6" />,
    title: 'Scan QR Code',
    description: 'Scan the QR code on any canteen poster with your phone camera',
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: 'Browse & Add',
    description: 'Pick your favorites from the live menu with real-time stock levels',
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Pay Instantly',
    description: 'Pay via UPI, cards, or use your Canteen Credits — no sign-up needed',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Pick Up',
    description: 'Show your 4-digit code at the counter and grab your food',
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-sm text-brand-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Canteen is open
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Skip the Queue. <br />
              <span className="gradient-text">Order from Your Phone.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              No app to download, no account to create. Just scan, pick, pay, and eat.
              Your lunch break just got{' '}
              <span className="text-brand-400 font-semibold">30 minutes shorter</span>.
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
        <h2 className="text-2xl font-bold text-white text-center mb-12">
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
              <div className="w-14 h-14 rounded-2xl gradient-brand mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <span className="text-white">{step.icon}</span>
              </div>
              {/* Text */}
              <h3 className="text-base font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-zinc-600">
            Built for CMRIT students · Powered by Razorpay &amp; Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
