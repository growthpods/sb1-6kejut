/*
  # Add Time Commitment and Application URL Fields to Jobs Table

  This migration adds two new fields to the jobs table:
  - `time_commitment` (text, nullable): Indicates when the job is available (Evening, Weekend, Summer)
  - `application_url` (text, nullable): Direct URL where students can apply for the job
*/

-- Add time_commitment field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS time_commitment text;

-- Add application_url field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_url text;

-- Update existing jobs with default values if needed
-- This is commented out as we're not setting defaults for existing records
-- UPDATE jobs SET time_commitment = 'Summer' WHERE time_commitment IS NULL;
-- UPDATE jobs SET application_url = external_link WHERE application_url IS NULL AND external_link IS NOT NULL;

COMMENT ON COLUMN jobs.time_commitment IS 'When the job is available (Evening, Weekend, Summer)';
COMMENT ON COLUMN jobs.application_url IS 'Direct URL where students can apply for the job';
