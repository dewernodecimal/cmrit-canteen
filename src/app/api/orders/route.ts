import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyStaffPin } from '@/lib/verifyStaffPin';

export const dynamic = 'force-dynamic';

// GET: Fetch all active orders (for staff dashboard)
export async function GET(req: NextRequest) {
  // Issue 1 fix: rate-limited, timing-safe PIN check
  const authError = verifyStaffPin(req);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*)`)
      .in('status', ['awaiting_verification', 'confirmed', 'in_progress', 'ready'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update order status
export async function PATCH(req: NextRequest) {
  // Issue 1 fix: rate-limited, timing-safe PIN check
  const authError = verifyStaffPin(req);
  if (authError) return authError;

  try {
    const { order_id, status, cancel_reason } = await req.json();

    const supabase = createAdminClient();

    // If cancelling, issue credit
    if (status === 'cancelled') {
      const { data: order } = await supabase
        .from('orders')
        .select('phone, total_amount')
        .eq('id', order_id)
        .single();

      if (order) {
        // Issue credit
        await supabase
          .from('profiles')
          .upsert(
            { phone: order.phone, credit_balance: 0 },
            { onConflict: 'phone', ignoreDuplicates: true }
          );

        await supabase.rpc('increment_credits', {
          p_phone: order.phone,
          p_amount: order.total_amount,
        });

        // Log transaction
        await supabase.from('transactions').insert({
          phone: order.phone,
          order_id,
          type: 'credit_issued',
          amount: order.total_amount,
          note: cancel_reason || 'Cancelled by staff',
        });
      }
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
