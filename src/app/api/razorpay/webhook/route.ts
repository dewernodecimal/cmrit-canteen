import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

// Razorpay sends POST webhook events to this endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 1. Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse the event
    const event = JSON.parse(body);
    const eventType = event.event;

    // We only care about payment.captured
    if (eventType !== 'payment.captured') {
      return NextResponse.json({ status: 'ignored' });
    }

    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    const supabase = createAdminClient();

    // 3. Find our order by razorpay_order_id
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();

    if (findError || !order) {
      console.error('Order not found for razorpay_order_id:', razorpayOrderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 4. Call the atomic RPC to process payment
    //    This handles stock decrement, collection code generation,
    //    and auto-credit if stock is depleted
    const { data: result, error: rpcError } = await supabase.rpc(
      'process_confirmed_payment',
      {
        p_order_id: order.id,
        p_razorpay_payment_id: razorpayPaymentId,
      }
    );

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

    console.log('Payment processed:', result);

    // 5. If credits were applied, deduct them via direct SQL
    const { data: confirmedOrder } = await supabase
      .from('orders')
      .select('credits_used, phone')
      .eq('id', order.id)
      .single();

    if (confirmedOrder && confirmedOrder.credits_used > 0) {
      // Decrement credit balance directly
      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('phone', confirmedOrder.phone)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            credit_balance: Math.max(0, profile.credit_balance - confirmedOrder.credits_used),
            updated_at: new Date().toISOString(),
          })
          .eq('phone', confirmedOrder.phone);
      }

      // Log the credit transaction
      await supabase.from('transactions').insert({
        phone: confirmedOrder.phone,
        order_id: order.id,
        type: 'credit_redeemed',
        amount: confirmedOrder.credits_used,
        note: 'Credits applied at checkout',
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
