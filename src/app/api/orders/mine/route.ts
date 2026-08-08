// ============================================================
// GET /api/orders/mine
// Issue 2+9 fix: Authenticated server-side order fetching.
// Replaces direct Supabase anon client queries from the browser.
// The anon key cannot read orders directly anymore (RLS migration 008).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyPhoneOwnership } from '@/lib/verifyPhone';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed } = checkRateLimit(`orders-mine:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const phone = req.nextUrl.searchParams.get('phone');
    const password = req.headers.get('x-password');

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // Verify caller owns this phone before exposing any order data
    const ownsPhone = await verifyPhoneOwnership(phone, password);
    if (!ownsPhone) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*)`)
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
