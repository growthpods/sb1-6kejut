/*
  # Optimize Queries for High School InterMatch

  1. Add Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for common query patterns
    - Optimize job search and filtering

  2. Changes
    - Add indexes on jobs table for common search fields
    - Add indexes on applications table for status and dates
    - Add composite indexes for related lookups
*/

-- Add indexes for job searches
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs (company);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (location);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs (type);
CREATE INDEX IF NOT EXISTS idx_jobs_level ON jobs (level);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs (posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs (employer_id);

-- Add indexes for application lookups
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications (applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications (user_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs (type, level, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_user ON applications (job_id, user_id);

-- Add function for full text search
CREATE OR REPLACE FUNCTION search_jobs(search_query text)
RETURNS SETOF jobs AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM jobs
  WHERE to_tsvector('english', title || ' ' || company || ' ' || description) @@ plainto_tsquery('english', search_query)
  ORDER BY posted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;