-- Fix education_level values to prioritize College over High School when both are present
UPDATE jobs
SET education_level = 
  CASE 
    WHEN (LOWER(title) LIKE '%college%' OR LOWER(description) LIKE '%college%' OR LOWER(description) LIKE '%university%') THEN 'College'
    WHEN (LOWER(title) LIKE '%high school%' OR LOWER(description) LIKE '%high school%') THEN 'High School'
    ELSE NULL
  END;
