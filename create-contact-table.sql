-- Create contact_forms table
CREATE TABLE IF NOT EXISTS contact_forms (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  message TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_contact_forms_email ON contact_forms(email);

-- Create an index on createdAt for sorting
CREATE INDEX idx_contact_forms_created_at ON contact_forms("createdAt");

-- Add RLS policy
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for contact form submissions)
CREATE POLICY "Allow public to insert contact forms" ON contact_forms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only allow authenticated (admin) to read
CREATE POLICY "Only authenticated can read contact forms" ON contact_forms
  FOR SELECT
  TO authenticated
  USING (true);