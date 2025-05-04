/*
  # Add Source and Career Site URL Fields to Jobs Table

  This migration adds two new fields to the jobs table:
  - `source` (text, nullable): Indicates the source of the job posting (e.g., 'RapidAPI', 'Manual')
  - `career_site_url` (text, nullable): URL to the company's career site
*/

-- Add source field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source text;

-- Add career_site_url field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS career_site_url text;

COMMENT ON COLUMN jobs.source IS 'Source of the job posting (e.g., RapidAPI, Manual)';
COMMENT ON COLUMN jobs.career_site_url IS 'URL to the company career site';
