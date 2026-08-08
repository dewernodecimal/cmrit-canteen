import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyStaffPin } from '@/lib/verifyStaffPin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Issue 1 fix: rate-limited, timing-safe PIN check
  const authError = verifyStaffPin(req);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Fetch transactions for the past 2 weeks
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        phone,
        type,
        amount,
        note,
        created_at,
        order_id
      `)
      .gte('created_at', twoWeeksAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
