-- Add manual_education_level column to jobs table for manual override
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS manual_education_level VARCHAR(255);

-- Create an index for faster filtering if needed
CREATE INDEX IF NOT EXISTS idx_jobs_manual_education_level ON jobs(manual_education_level); 