import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Verify staff PIN
    const pin = req.headers.get('x-staff-pin');
    if (pin !== process.env.STAFF_PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, action } = await req.json();

    if (!order_id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === 'approve') {
      // Run the atomic RPC to deduct stock, verify order, and generate code
      const { data, error } = await supabase.rpc('process_confirmed_payment', {
        p_order_id: order_id,
      });

      if (error) throw error;
      
      if (!data.success) {
         return NextResponse.json({ error: data.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, collection_code: data.collection_code });
    } else {
      // Reject: cancel the order and refund credits
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order_id)
        .eq('status', 'awaiting_verification')
        .select()
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found or already processed' }, { status: 400 });
      }

      if (order.credits_used > 0) {
        // Refund credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('credit_balance')
          .eq('phone', order.phone)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ credit_balance: profile.credit_balance + order.credits_used })
            .eq('phone', order.phone);
            
          await supabase.from('transactions').insert({
            phone: order.phone,
            order_id: order.id,
            type: 'credit_issued',
            amount: order.credits_used,
            note: 'Refund: UTR verification rejected',
          });
        }
      }

      return NextResponse.json({ success: true, status: 'rejected' });
    }
  } catch (err: any) {
    console.error('UTR verify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
