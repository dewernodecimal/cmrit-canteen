-- ============================================================
-- Migration 003: Add password auth + fix increment_credits
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add password_hash column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Fix/Replace increment_credits with correct parameter order
CREATE OR REPLACE FUNCTION increment_credits(p_phone TEXT, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET credit_balance = credit_balance + p_amount,
      updated_at = now()
  WHERE phone = p_phone;
END;
$$;

-- 3. RPC: Register a student (set password for the first time)
CREATE OR REPLACE FUNCTION register_student(
  p_phone TEXT,
  p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile if doesn't exist
  INSERT INTO profiles (phone, password_hash)
  VALUES (p_phone, p_password_hash)
  ON CONFLICT (phone) DO NOTHING;

  -- If profile already has a password, don't overwrite
  IF EXISTS (
    SELECT 1 FROM profiles WHERE phone = p_phone AND password_hash IS NOT NULL
  ) THEN
    -- Check if this was just inserted (new user)
    IF (SELECT password_hash FROM profiles WHERE phone = p_phone) != p_password_hash THEN
      RETURN jsonb_build_object('success', false, 'error', 'Account already registered. Please log in.');
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 4. RPC: Verify student login
CREATE OR REPLACE FUNCTION verify_student_login(
  p_phone TEXT,
  p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE phone = p_phone;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found. Please register first.');
  END IF;

  IF v_profile.password_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not set up. Please register a password.');
  END IF;

  IF v_profile.password_hash != p_password_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect password.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'credit_balance', v_profile.credit_balance,
    'display_name', v_profile.display_name
  );
END;
$$;
