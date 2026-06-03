import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyStaffPin } from '@/lib/verifyStaffPin';

async function stretchPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return Buffer.from(bits).toString('hex');
}

function generateSalt(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function POST(req: NextRequest) {
  // Issue 1 fix: rate-limited, timing-safe PIN check
  const authError = verifyStaffPin(req);
  if (authError) return authError;

  try {
    const { phone, new_password } = await req.json();

    // Validate input
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    if (!new_password || new_password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'No account found for this phone number' }, { status: 404 });
    }

    // Hash the new password with a fresh unique salt using PBKDF2
    const salt = generateSalt();
    const passwordHash = await stretchPassword(new_password, salt);

    // Update password in the database
    const { error } = await supabase
      .from('profiles')
      .update({ password_hash: `pbkdf2:${salt}:${passwordHash}` })
      .eq('phone', phone);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
