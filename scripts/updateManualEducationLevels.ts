import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateManualEducationLevels() {
  console.log('Starting manual education level update...');

  const jobsToUpdate = [
    {
      title: 'Business Process Analyst Intern, application via RippleMatch',
      company: 'RippleMatch',
      location: 'Austin, Texas, United States',
      manual_education_level: 'High School'
    },
    {
      title: 'AI Digital Marketing Intern',
      company: 'Hawl Technologies, LLC',
      location: 'Texas, United States',
      manual_education_level: 'High School'
    },
    {
      title: 'Business Intelligence Intern, application via RippleMatch',
      company: 'RippleMatch',
      location: 'Houston, Texas, United States',
      manual_education_level: 'High School'
    },
    {
      title: 'Civil/Environmental Engineering Intern',
      company: 'Lensa',
      location: 'Austin, Texas, United States',
      manual_education_level: 'High School'
    },
    {
      title: 'Summer Internship Program',
      company: 'Lensa',
      location: 'Irving, Texas, United States',
      manual_education_level: 'High School'
    },
    {
      title: 'Design Verification Intern',
      company: 'Lensa',
      location: 'Austin, Texas, United States',
      manual_education_level: 'High School'
    },
    {
      title: 'Marketing Internship Opportunity - Corporate',
      company: 'Lensa',
      location: 'Houston, TX 77042, USA',
      manual_education_level: 'High School'
    },
    {
      title: 'Process Development Intern',
      company: 'Lonza',
      location: 'United States, Houston (Texas)',
      manual_education_level: 'High School'
    },
    {
      title: 'Marketing Intern',
      company: 'Lensa',
      location: 'Houston, TX',
      manual_education_level: 'High School'
    },
    {
      title: 'Construction Project Intern - Austin Commercial',
      company: 'Lensa',
      location: 'Houston, TX',
      manual_education_level: 'High School'
    },
    {
      title: 'Banking Analyst Intern, application via RippleMatch',
      company: 'RippleMatch',
      location: 'Houston, Texas, United States',
      manual_education_level: 'High School'
    }
  ];

  for (const job of jobsToUpdate) {
    console.log(`Attempting to update: ${job.title} by ${job.company}`);
    const { data, error } = await supabase
      .from('jobs')
      .update({ manual_education_level: job.manual_education_level })
      .eq('title', job.title)
      .eq('company', job.company)
      .eq('location', job.location)
      .select();

    if (error) {
      console.error(`Error updating job "${job.title}":`, error);
    } else if (data && data.length === 0) {
      console.warn(`Job "${job.title}" not found for update.`);
    } else {
      console.log(`Successfully updated "${job.title}" to manual_education_level: ${job.manual_education_level}`);
    }
  }

  console.log('Manual education level update complete.');
}

updateManualEducationLevels();
