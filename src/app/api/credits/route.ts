import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

// ── GET: Check credit balance — requires phone + password in headers ──────────
// A student can only see THEIR OWN balance. No anonymous snooping.
// ─────────────────────────────────────────────────────────────────────────────

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  if (storedHash.startsWith('pbkdf2:')) {
    const [, salt, hash] = storedHash.split(':');
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    return Buffer.from(bits).toString('hex') === hash;
  }

  // Legacy SHA-256
  const { createHash } = await import('crypto');
  return createHash('sha256').update(password + 'cmrit_canteen_salt').digest('hex') === storedHash;
}

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');
    const password = req.headers.get('x-password');
    const withHistory = req.nextUrl.searchParams.get('history') === 'true';

    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed } = checkRateLimit(`credits:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credit_balance, password_hash')
      .eq('phone', phone)
      .single();

    if (error || !profile) {
      return NextResponse.json({ credit_balance: 0, transactions: [] });
    }

    // Verify the caller is actually this user
    const valid = await verifyPassword(password, profile.password_hash ?? '');
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (withHistory) {
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(20);
      return NextResponse.json({ credit_balance: profile.credit_balance, transactions: txns || [] });
    }

    return NextResponse.json({ credit_balance: profile.credit_balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
