import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Basic auth check (in production, use better auth)
    const pin = req.headers.get('x-staff-pin');
    if (pin !== process.env.STAFF_PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, amount } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    if (!amount || amount <= 0 || amount > 500000) {
      return NextResponse.json({ error: 'Amount must be between ₹1 and ₹5000' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Ensure profile exists first
    await supabase
      .from('profiles')
      .upsert({ phone }, { onConflict: 'phone', ignoreDuplicates: true });

    // Increment credits using RPC
    const { error } = await supabase.rpc('increment_credits', {
      p_phone: phone,
      p_amount: amount,
    });

    if (error) {
      throw error;
    }

    // Log the transaction
    await supabase.from('transactions').insert({
      phone,
      type: 'credit_issued',
      amount,
      note: 'Added by staff at counter',
    });

    return NextResponse.json({ success: true, message: `Added ${amount} credits to ${phone}` });
  } catch (err: any) {
    console.error('Add credits error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
