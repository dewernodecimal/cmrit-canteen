import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    // 7. Send push notification to canteen guy via ntfy.sh
    try {
      const topic = process.env.NTFY_TOPIC || 'cmritcanteen';
      const host = req.headers.get('host') || 'cmrit-canteen.vercel.app';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const clickUrl = `${protocol}://${host}/staff`;
      
      const itemsSummary = orderItems
        .map((item: any) => `${item.quantity}x ${item.item_name}`)
        .join(', ');

      const ntfyRes = await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        cache: 'no-store',
        body: `\ud83c\udf7d\ufe0f New Order Received!\nItems: ${itemsSummary}\nTotal: \u20b9${totalAmount}\nCollection Code: ${collectionCode}`,
        headers: {
          'Title': 'New Order Received!',
          'Priority': 'high',
          'Tags': 'tada,shopping_cart,bell',
          'Click': clickUrl,
        },
      });
      const ntfyText = await ntfyRes.text();
      if (!ntfyRes.ok) {
        console.error('ntfy error response:', ntfyText);
      }
    } catch (err) {
      console.error('Failed to send ntfy push notification:', err);
    }

    return NextResponse.json({ order_id: order.id });

  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
