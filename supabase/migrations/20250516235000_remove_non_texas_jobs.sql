-- Remove all jobs that don't have a Texas location
DELETE FROM jobs
WHERE location NOT ILIKE '%Texas%' 
  AND location NOT ILIKE '%TX%';
