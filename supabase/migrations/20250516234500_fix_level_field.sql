-- Fix level field for jobs that have education levels in the level field
UPDATE jobs
SET level = 'Entry Level'
WHERE level IN ('High School', 'College');
