import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: Fetch menu items (public)
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update menu item (staff only)
export async function PATCH(req: NextRequest) {
  try {
    const pin = req.headers.get('x-staff-pin');
    if (pin !== process.env.STAFF_PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await req.json();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Reset all stock to daily cap (staff only)
export async function POST(req: NextRequest) {
  try {
    const pin = req.headers.get('x-staff-pin');
    if (pin !== process.env.STAFF_PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'reset_stock') {
      const supabase = createAdminClient();

      // Reset all items: current_stock = daily_stock_cap
      const { error } = await supabase.rpc('reset_daily_stock');
      if (error) throw error;

      return NextResponse.json({ status: 'ok', message: 'All stock reset' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
