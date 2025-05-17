-- Add education_level column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS education_level VARCHAR(255);

-- Create an index on education_level for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_education_level ON jobs(education_level);

-- Update existing jobs to have education level based on job title and description
UPDATE jobs
SET education_level = 
  CASE 
    WHEN LOWER(title) LIKE '%high school%' OR LOWER(description) LIKE '%high school%' THEN 'High School'
    WHEN LOWER(title) LIKE '%college%' OR LOWER(description) LIKE '%college%' OR LOWER(description) LIKE '%university%' THEN 'College'
    ELSE NULL
  END;
