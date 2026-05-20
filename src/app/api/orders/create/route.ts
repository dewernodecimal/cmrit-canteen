import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

async function sendTwilioAlert(orderId: string, collectionCode: string, totalAmount: number) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const staffPhone = process.env.CANTEEN_STAFF_PHONE;
    
    if (!accountSid || !authToken || !staffPhone) {
      console.warn('Twilio configuration or staff phone not found.');
      return;
    }

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    // 1. Send SMS Alert
    try {
      const fromSms = process.env.TWILIO_SMS_FROM || '+14155238886';
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: staffPhone,
          From: fromSms,
          Body: `🛎️ CMRIT Bites Alert: New order placed!\nCode: ${collectionCode}\nAmount: ₹${(totalAmount / 100).toFixed(2)}\nOrder: #${orderId.slice(0, 8)}\nCheck staff dashboard!`,
        }).toString(),
      });
    } catch (e) {
      console.error('Twilio SMS failed:', e);
    }

    // 2. Send WhatsApp Sandbox Alert as Backup (highly reliable with loud chime)
    try {
      const fromWa = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${staffPhone}`,
          From: fromWa,
          Body: `🛎️ *CMRIT Bites Alert*\n\nNew order received!\n*Code:* ${collectionCode}\n*Amount:* ₹${(totalAmount / 100).toFixed(2)}\n*Order ID:* #${orderId.slice(0, 8)}\n\nPlease prepare the order and check the staff dashboard!`,
        }).toString(),
      });
    } catch (e) {
      console.error('Twilio WhatsApp failed:', e);
    }
  } catch (err) {
    console.error('Twilio alert general error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, items } = body;

    // ── 0. Check if the shop is currently accepting orders ─────────────────────
    const supabasePublic = createAdminClient();
    const { data: shopSettings } = await supabasePublic
      .from('site_settings')
      .select('value')
      .eq('key', 'shop_status')
      .single();

    if (shopSettings?.value?.manual_close === true) {
      return NextResponse.json(
        { error: 'The canteen is currently closed and not accepting orders. Please try again later.' },
        { status: 503 }
      );
    }
    // ───────────────────────────────────────────────────────────────────────────

    // Validate phone
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ensure profile exists (upsert)
    await supabase
      .from('profiles')
      .upsert({ phone }, { onConflict: 'phone', ignoreDuplicates: true });

    // 2. Fetch menu items to get current prices
    const itemIds = items.map((i: any) => i.menu_item_id);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', itemIds);

    if (menuError || !menuItems) {
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }

    // Build order items with price snapshots
    const orderItems = items.map((i: any) => {
      const menuItem = menuItems.find((m) => m.id === i.menu_item_id);
      if (!menuItem) throw new Error(`Item ${i.menu_item_id} not found`);
      if (!menuItem.is_available || menuItem.current_stock < i.quantity) {
        throw new Error(`${menuItem.name} is out of stock`);
      }
      return {
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        unit_price: menuItem.price,
        item_name: menuItem.name,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // 3. Calculate credits
    let creditsAvailable = 0;
    const { data: profile } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('phone', phone)
      .single();

    if (profile && profile.credit_balance > 0) {
      creditsAvailable = profile.credit_balance;
    }

    if (creditsAvailable < totalAmount) {
      return NextResponse.json({ error: 'Insufficient credits. Please recharge at the counter.' }, { status: 400 });
    }

    // 4. Create order in DB (Instantly Confirmed)
    const collectionCode = String(Math.floor(1000 + Math.random() * 9000));
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        phone,
        status: 'confirmed',
        total_amount: totalAmount,
        credits_used: totalAmount,
        utr_number: null,
        collection_code: collectionCode,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 5. Insert order items
    const { error: itemsError } = await supabase.from('order_items').insert(
      orderItems.map((item: any) => ({
        ...item,
        order_id: order.id,
      }))
    );

    if (itemsError) {
      console.error('Items insert error:', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to add items to order' }, { status: 500 });
    }

    // 6. Process credit deduction and stock decrement atomically
    const { data: result, error: rpcError } = await supabase.rpc('process_credit_payment', {
      p_order_id: order.id,
      p_phone: phone,
      p_credits: totalAmount,
    });

    if (rpcError || !result?.success) {
      console.error('Payment error:', rpcError || result?.error);
      // Rollback: delete the order if payment failed
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ 
        error: result?.error || 'Payment failed. Please check your credit balance.' 
      }, { status: 400 });
    }

    // Trigger Twilio SMS & WhatsApp alerts in the background (non-blocking)
    sendTwilioAlert(order.id, collectionCode, totalAmount).catch((err) => {
      console.error('Background alert error:', err);
    });

    return NextResponse.json({ order_id: order.id });

  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
