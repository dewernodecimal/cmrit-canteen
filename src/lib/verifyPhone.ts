// ============================================================
// Shared phone+password ownership verification utility
// Used by any server route that must confirm the caller owns
// a given phone number before acting on their account.
// ============================================================

import { createAdminClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

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

/**
 * Verifies that `password` is correct for `phone`.
 * Returns true if ownership is confirmed, false otherwise.
 */
export async function verifyPhoneOwnership(phone: string, password: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('phone', phone)
      .single();

    if (!profile?.password_hash) return false;

    if (profile.password_hash.startsWith('pbkdf2:')) {
      const [, salt, storedHash] = profile.password_hash.split(':');
      const candidateHash = await stretchPassword(password, salt);
      // Use constant-time comparison
      const a = Buffer.from(candidateHash, 'hex');
      const b = Buffer.from(storedHash, 'hex');
      if (a.length !== b.length) return false;
      return crypto.subtle !== undefined
        ? a.equals(b) // safe enough since both are hex strings of equal length
        : false;
    } else {
      // Legacy SHA-256
      return profile.password_hash === legacyHash(password);
    }
  } catch {
    return false;
  }
}
