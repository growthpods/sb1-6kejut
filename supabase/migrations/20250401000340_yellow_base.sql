/*
  # Initial Schema Setup for High School InterMatch

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `description` (text)
      - `requirements` (text array)
      - `type` (text)
      - `level` (text)
      - `applicants` (integer)
      - `posted_at` (timestamptz)
      - `external_link` (text, nullable)
      - `company_logo` (text, nullable)
      - `employer_id` (text)

    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `user_id` (uuid)
      - `status` (text)
      - `applied_at` (timestamptz)
      - `resume_url` (text, nullable)
      - `cover_letter` (text, nullable)

  2. Security
    - Enable RLS on both tables
    - Add policies for job visibility and application management
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  type text NOT NULL,
  level text NOT NULL,
  applicants integer DEFAULT 0,
  posted_at timestamptz DEFAULT now(),
  external_link text,
  company_logo text,
  employer_id text NOT NULL
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending',
  applied_at timestamptz DEFAULT now(),
  resume_url text,
  cover_letter text
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policies for jobs table
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Employers can insert their own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employer_id::uuid);

CREATE POLICY "Employers can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id::uuid)
  WITH CHECK (auth.uid() = employer_id::uuid);

CREATE POLICY "Employers can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id::uuid);

-- Policies for applications table
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view applications for their jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id::uuid = auth.uid()
    )
  );