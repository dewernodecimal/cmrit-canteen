// ============================================================
// Staff PIN verification with rate-limiting + timing-safe compare
// Apply to every staff-facing API route.
// ============================================================

import { checkRateLimit } from '@/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifies the `x-staff-pin` header using:
 * 1. IP-based rate limiting (5 attempts / 15 min window)
 * 2. crypto.timingSafeEqual to prevent timing attacks
 *
 * Returns null if auth passes, or a NextResponse 401/429 to return immediately.
 */
export function verifyStaffPin(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rateLimitKey = `staff:${ip}`;
  const { allowed, remaining, retryAfterMs } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    const minutesLeft = Math.ceil(retryAfterMs / 60000);
    console.warn(`[STAFF AUTH] Rate limit exceeded for IP ${ip}`);
    return NextResponse.json(
      { error: `Too many attempts. Please wait ${minutesLeft} minute(s).` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const pin = req.headers.get('x-staff-pin') ?? '';
  const expected = process.env.STAFF_PIN ?? '';

  // constant-time comparison to prevent timing oracle attacks
  const pinBuf = Buffer.from(pin.padEnd(expected.length, '\0'));
  const expBuf = Buffer.from(expected.padEnd(pin.length, '\0'));
  // Both must be same length for timingSafeEqual
  const maxLen = Math.max(pinBuf.length, expBuf.length);
  const a = Buffer.alloc(maxLen);
  const b = Buffer.alloc(maxLen);
  pinBuf.copy(a);
  expBuf.copy(b);

  let match = false;
  try {
    match = require('crypto').timingSafeEqual(a, b) && pin.length === expected.length;
  } catch {
    match = false;
  }

  if (!match) {
    console.warn(`[STAFF AUTH] Failed PIN attempt from IP ${ip} — ${remaining} attempts left`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // auth passed
}
