import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Check credit balance (and optionally transaction history) by phone
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');
    const withHistory = req.nextUrl.searchParams.get('history') === 'true';

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('phone', phone)
      .single();

    if (error || !data) {
      return NextResponse.json({ credit_balance: 0, transactions: [] });
    }

    if (withHistory) {
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(20);
      return NextResponse.json({ credit_balance: data.credit_balance, transactions: txns || [] });
    }

    return NextResponse.json({ credit_balance: data.credit_balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

