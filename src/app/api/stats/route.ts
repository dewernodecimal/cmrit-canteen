import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Get total number of registered profiles
    const { count, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profileError) throw profileError;

    // 2. Get transaction volume over the past two weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    // We sum up 'total_amount' for all completed orders
    const { data: orders, error: txnError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', twoWeeksAgo.toISOString());

    if (txnError) throw txnError;

    const totalVolume = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    return NextResponse.json({
      users: count || 0,
      volume: totalVolume
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
