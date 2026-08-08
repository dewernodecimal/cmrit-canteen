import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { verifyStaffPin } from '@/lib/verifyStaffPin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'shop_status')
      .single();

    if (error) throw error;
    return NextResponse.json(data.value);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = verifyStaffPin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('site_settings')
      .update({ 
        value: body,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shop_status')
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
