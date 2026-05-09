import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Check credit balance by phone
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');

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
      return NextResponse.json({ credit_balance: 0 });
    }

    return NextResponse.json({ credit_balance: data.credit_balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
