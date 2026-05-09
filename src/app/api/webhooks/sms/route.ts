import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * WEBHOOK: /api/webhooks/sms
 * This endpoint receives SMS notifications from an SMS Forwarder app
 * installed on the canteen's bank-linked phone.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Basic Security Check
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.SMS_GATEWAY_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, from } = await req.json();
    console.log(`Received SMS from ${from}: ${text}`);

    // 2. Parse the UTR and Amount from the SMS
    // Typical Indian Bank SMS: "Rs.50.00 credited to a/c ... Ref:312456789012"
    // Regex matches 12-digit numbers (UTR)
    const utrMatch = text.match(/\b\d{12}\b/);
    // Regex matches amounts like 50.00 or 150
    const amountMatch = text.match(/Rs\.?\s?([0-9,]+(?:\.[0-9]{2})?)/i);

    if (!utrMatch) {
      return NextResponse.json({ error: 'No UTR found in SMS' }, { status: 200 });
    }

    const utrNumber = utrMatch[0];
    const supabase = createAdminClient();

    // 3. Find the order with this UTR number
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('utr_number', utrNumber)
      .eq('status', 'awaiting_verification')
      .single();

    if (orderError || !order) {
      console.log(`No pending order found for UTR: ${utrNumber}`);
      // We return 200 because we don't want the SMS app to retry 
      // (maybe the student hasn't submitted the order yet)
      return NextResponse.json({ message: 'UTR received, no matching order yet' });
    }

    // 4. Finalize the order using the RPC
    const { data, error: rpcError } = await supabase.rpc('process_confirmed_payment', {
      p_order_id: order.id,
    });

    if (rpcError || !data?.success) {
      console.error('RPC Error during SMS auto-verify:', rpcError || data?.error);
      return NextResponse.json({ error: 'Failed to verify' }, { status: 500 });
    }

    console.log(`Successfully auto-verified order ${order.id} via SMS!`);
    return NextResponse.json({ success: true, order_id: order.id });

  } catch (err: any) {
    console.error('SMS Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
