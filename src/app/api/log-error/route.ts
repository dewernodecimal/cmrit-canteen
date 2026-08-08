// ============================================================
// POST /api/log-error
// Issue 10 fix: add rate limiting and body size cap to prevent
// log flooding / serverless cost abuse from unauthenticated callers.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

const MAX_BODY_BYTES = 4096; // 4 KB cap — prevents huge log entries

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP — max 8 error reports per 15 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed } = checkRateLimit(`log-error:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    // Body size guard
    const contentLength = parseInt(req.headers.get('content-length') ?? '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
    }

    const body = await req.json();

    // Log to Vercel runtime logs (visible in dashboard) — no disk writes on serverless
    console.error('[CLIENT ERROR]', JSON.stringify(body));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
