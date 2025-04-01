/*
  # Remove LinkedIn Subscription

  1. Changes
    - Drop the LinkedIn profile update trigger
    - Drop the LinkedIn profile update function
    - Keep the basic profile functionality
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_profile_update ON profiles;

-- Drop the function
DROP FUNCTION IF EXISTS handle_linkedin_profile_update();

-- Keep the profiles table and its basic structure
-- but remove LinkedIn-specific columns
ALTER TABLE profiles
DROP COLUMN IF EXISTS linkedin_id,
DROP COLUMN IF EXISTS headline,
DROP COLUMN IF EXISTS education,
DROP COLUMN IF EXISTS experience;