import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

// Lazy-init to avoid build-time crash when env vars aren't set
let razorpay: Razorpay | null = null;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpay;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, items, use_credits } = body;

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
    let creditsApplied = 0;
    if (use_credits) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('phone', phone)
        .single();

      if (profile && profile.credit_balance > 0) {
        creditsApplied = Math.min(profile.credit_balance, totalAmount);
      }
    }

    const amountToPay = totalAmount - creditsApplied;

    // 4. Create order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        phone,
        status: amountToPay > 0 ? 'pending_payment' : 'confirmed',
        total_amount: totalAmount,
        credits_used: creditsApplied,
        collection_code: amountToPay <= 0
          ? String(Math.floor(1000 + Math.random() * 9000))
          : null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 5. Insert order items
    await supabase.from('order_items').insert(
      orderItems.map((item: any) => ({
        ...item,
        order_id: order.id,
      }))
    );

    // 6. If fully covered by credits, process immediately
    if (amountToPay <= 0) {
      // Deduct credits
      await supabase.rpc('process_credit_payment', {
        p_order_id: order.id,
        p_phone: phone,
        p_credits: creditsApplied,
      });

      return NextResponse.json({
        order_id: order.id,
        razorpay_order_id: null,
        amount_to_pay: 0,
        credits_applied: creditsApplied,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    }

    // 7. Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountToPay,
      currency: 'INR',
      receipt: order.id,
      notes: {
        order_id: order.id,
        phone,
      },
    });

    // 8. Store Razorpay order ID
    await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    return NextResponse.json({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount_to_pay: amountToPay,
      credits_applied: creditsApplied,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
