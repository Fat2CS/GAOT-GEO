/*
  # Create IP rate limiting table

  1. New Tables
    - `ip_rate_limits`
      - `id` (uuid, primary key)
      - `ip_address` (text, indexed)
      - `user_id` (uuid, nullable, references auth.users)
      - `endpoint` (text) - 'analyze' or 'rewrite'
      - `created_at` (timestamptz, default now())
      - Index on ip_address and created_at for fast queries
  
  2. Security
    - Enable RLS on `ip_rate_limits` table
    - Only service role can write to this table
    - No read policies needed (backend only)
  
  3. Cleanup
    - Function to auto-delete records older than 24 hours
*/

CREATE TABLE IF NOT EXISTS ip_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL CHECK (endpoint IN ('analyze', 'rewrite')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_ip_created 
  ON ip_rate_limits(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_created 
  ON ip_rate_limits(created_at);

ALTER TABLE ip_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
  ON ip_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM ip_rate_limits
  WHERE created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
