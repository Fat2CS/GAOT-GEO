/*
  # Create contacts table

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key) - Unique identifier for each contact message
      - `name` (text) - Name of the person contacting
      - `email` (text) - Email address for reply
      - `message` (text) - Contact message content
      - `created_at` (timestamptz) - When the message was sent
  
  2. Security
    - Enable RLS on `contacts` table
    - Add policy for public to insert contact messages (anyone can contact)
    - Add policy for authenticated users to read their own messages
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own messages"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));