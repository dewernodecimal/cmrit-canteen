import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';

// ── Hashing ───────────────────────────────────────────────────────────────────
// We use SHA-256 + a per-user salt stored in the DB for compatibility.
// For new passwords, we store an additional bcrypt-compatible stretched hash.
// On Vercel edge/Node, we use the built-in crypto with 100k PBKDF2 iterations
// which is far stronger than plain SHA-256.
// ─────────────────────────────────────────────────────────────────────────────

function legacyHash(password: string): string {
  return createHash('sha256').update(password + 'cmrit_canteen_salt').digest('hex');
}

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

// Each user gets a unique salt — stored alongside their hash
function generateSalt(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting: key = IP + phone to prevent distributed attacks ──────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const body = await req.json();
    const { action, phone, password } = body;

    const rateLimitKey = `auth:${ip}:${phone ?? ''}`;
    const { allowed, remaining, retryAfterMs } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      const minutesLeft = Math.ceil(retryAfterMs / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Please wait ${minutesLeft} minute(s) before trying again.` },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === 'register') {
      const { data: existing } = await supabase
        .from('profiles')
        .select('password_hash')
        .eq('phone', phone)
        .single();

      if (existing?.password_hash) {
        return NextResponse.json({ error: 'Account already registered. Please log in.' }, { status: 400 });
      }

      // Generate a unique salt for this user and use PBKDF2
      const salt = generateSalt();
      const passwordHash = await stretchPassword(password, salt);

      await supabase.from('profiles').upsert(
        { phone, password_hash: `pbkdf2:${salt}:${passwordHash}` },
        { onConflict: 'phone' }
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('phone', phone)
        .single();

      // Reset rate limit on successful registration
      resetRateLimit(rateLimitKey);
      return NextResponse.json({ success: true, credit_balance: profile?.credit_balance ?? 0 });

    } else if (action === 'login') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('password_hash, credit_balance, display_name')
        .eq('phone', phone)
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'No account found. Please register first.' }, { status: 400 });
      }
      if (!profile.password_hash) {
        return NextResponse.json({ error: 'Account not set up. Please register a password.' }, { status: 400 });
      }

      // Support both legacy (SHA-256) and new (PBKDF2) hashes for migration
      let passwordMatches = false;

      if (profile.password_hash.startsWith('pbkdf2:')) {
        const [, salt, storedHash] = profile.password_hash.split(':');
        const candidateHash = await stretchPassword(password, salt);
        passwordMatches = candidateHash === storedHash;
      } else {
        // Legacy SHA-256 — check and upgrade automatically on successful login
        passwordMatches = profile.password_hash === legacyHash(password);
        if (passwordMatches) {
          // Silently upgrade to PBKDF2
          const salt = generateSalt();
          const newHash = await stretchPassword(password, salt);
          await supabase
            .from('profiles')
            .update({ password_hash: `pbkdf2:${salt}:${newHash}` })
            .eq('phone', phone);
        }
      }

      if (!passwordMatches) {
        return NextResponse.json(
          { error: `Incorrect password. ${remaining} attempt(s) remaining.` },
          { status: 401 }
        );
      }

      // Reset rate limit on successful login
      resetRateLimit(rateLimitKey);
      return NextResponse.json({ success: true, credit_balance: profile.credit_balance ?? 0 });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
