import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

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

export async function PATCH(request: Request) {
  const staffPin = request.headers.get('x-staff-pin');
  if (staffPin !== process.env.STAFF_PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
