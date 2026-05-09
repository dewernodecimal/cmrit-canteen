import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'cmrit_canteen_salt').digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { action, phone, password } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const passwordHash = hashPassword(password);

    if (action === 'register') {
      // Insert profile, fail if password already set
      const { data: existing } = await supabase
        .from('profiles')
        .select('password_hash')
        .eq('phone', phone)
        .single();

      if (existing?.password_hash) {
        return NextResponse.json({ error: 'Account already registered. Please log in.' }, { status: 400 });
      }

      await supabase.from('profiles').upsert(
        { phone, password_hash: passwordHash },
        { onConflict: 'phone' }
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('phone', phone)
        .single();

      return NextResponse.json({ success: true, credit_balance: profile?.credit_balance ?? 0 });

    } else if (action === 'login') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('password_hash, credit_balance, display_name')
        .eq('phone', phone)
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'No account found. Please register first.' }, { status: 400 });
      }
      if (!profile.password_hash) {
        return NextResponse.json({ error: 'Account not set up. Please register a password.' }, { status: 400 });
      }
      if (profile.password_hash !== passwordHash) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
      }

      return NextResponse.json({ success: true, credit_balance: profile.credit_balance ?? 0 });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
