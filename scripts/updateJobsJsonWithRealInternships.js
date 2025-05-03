// Script to update jobs.json with real Houston internships

import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to create real Houston internship listings
function createHoustonInternships() {
  console.log('Creating real Houston internship listings...');
  
  // Real internship data based on scraped information
  const houstonInternships = [
    {
      id: uuidv4(),
      title: "High School Emerging Researcher Experience",
      company: "Houston Methodist",
      location: "Houston, TX",
      description: "The High School Emerging Researcher Experience is designed to introduce a select group of academically outstanding juniors and seniors to the world of translational research. By working alongside undergraduate research interns, students will gain valuable insights into the research process. Each summer project will be selected by the mentor assigned to the student and their specific area of expertise.",
      requirements: [
        "High school students who are currently in their junior or senior year",
        "Will be at least 16 years old by the start of the program (June 9th, 2025)",
        "Minimum 3.5 GPA",
        "Full-time commitment for the 8-week duration (June 9–August 1, 2025)"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      postedAt: new Date().toISOString(),
      applicationUrl: "https://www.houstonmethodist.org/academic-institute/education/research/summer-internship-program/highschoolresearchinternship/",
      companyLogo: `https://ui-avatars.com/api/?name=Houston+Methodist`
    },
    {
      id: uuidv4(),
      title: "UPWARDS High School Summer Research Training Program",
      company: "MD Anderson Cancer Center",
      location: "Houston, TX",
      description: "The MD Anderson Cancer Center UPWARDS research training initiative was instituted to offer hands-on, laboratory-based research experience so as to encourage underserved students to enter into STEM based academic and professional careers. Accepted students will take part in a paid/ full-time (40 hours a week) on-campus summer research experience at MD Anderson.",
      requirements: [
        "Local high school student (incoming senior for the fall of 2025)",
        "18 years or older by June 2, 2025",
        "Identifies as economically disadvantaged, educationally disadvantaged, with disabilities, or a first-generation student"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      postedAt: new Date().toISOString(),
      applicationUrl: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs/programs/upwards-summer-program.html",
      companyLogo: `https://ui-avatars.com/api/?name=MD+Anderson`
    },
    {
      id: uuidv4(),
      title: "NASA OSTEM High School Internship",
      company: "NASA Johnson Space Center",
      location: "Houston, TX",
      description: "NASA's Office of STEM Engagement (OSTEM) paid internships allow high school students to contribute to the agency's mission to advance science, technology, aeronautics, and space exploration. OSTEM internships offer students an opportunity to gain practical work experience while working side-by-side with mentors who are research scientists, engineers, and individuals from many other professions.",
      requirements: [
        "U.S. Citizen",
        "3.0 GPA on a 4.0 scale",
        "Be a full-time high school student",
        "Must be 16 years old at time of application"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      postedAt: new Date().toISOString(),
      applicationUrl: "https://stemgateway.nasa.gov/public/s/explore-opportunities",
      companyLogo: `https://ui-avatars.com/api/?name=NASA`
    },
    {
      id: uuidv4(),
      title: "Texas High School Aerospace Scholars Program",
      company: "NASA Johnson Space Center",
      location: "Houston, TX",
      description: "The High School Aerospace Scholars (HAS) program is a unique educational experience that combines online learning with an onsite summer experience at NASA Johnson Space Center. Texas high school juniors learn about space exploration, Earth science, technology, mathematics, and aeronautics through this interactive program.",
      requirements: [
        "Must be a Texas high school junior",
        "U.S. citizen",
        "Interest in science, technology, engineering, and mathematics",
        "Able to commit to a one-week summer experience at NASA Johnson Space Center"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      postedAt: new Date().toISOString(),
      applicationUrl: "https://www.nasa.gov/centers-and-facilities/johnson/texas-high-school-aerospace-scholars-a-launchpad-for-future-innovators/",
      companyLogo: `https://ui-avatars.com/api/?name=NASA`
    },
    {
      id: uuidv4(),
      title: "Summer Junior Volunteer Program",
      company: "Harris Health System",
      location: "Houston, TX",
      description: "The Harris Health Summer Junior Volunteer Program offers high school students the opportunity to gain valuable experience in a healthcare setting. Volunteers assist staff, interact with patients, and learn about various healthcare careers while contributing to the community.",
      requirements: [
        "High school student (ages 16-18)",
        "Minimum GPA of 3.0",
        "Ability to commit to at least 4 weeks during summer",
        "Interest in healthcare careers"
      ],
      type: "Volunteer",
      level: "Entry Level",
      applicants: 0,
      postedAt: new Date().toISOString(),
      applicationUrl: "https://www.harrishealth.org/volunteer-services",
      companyLogo: `https://ui-avatars.com/api/?name=Harris+Health`
    }
  ];
  
  return houstonInternships;
}

// Function to update jobs.json file with real Houston internships
async function updateJobsJson() {
  console.log('Updating jobs.json file with real Houston internships...');
  
  try {
    // Create Houston internship listings
    const houstonInternships = createHoustonInternships();
    
    // Path to jobs.json file
    const jobsFilePath = join(dirname(__dirname), 'public', 'jobs.json');
    
    // Read the current jobs.json file
    let currentJobs = [];
    try {
      const jobsData = await readFile(jobsFilePath, 'utf8');
      currentJobs = JSON.parse(jobsData);
      console.log(`Read ${currentJobs.length} jobs from jobs.json`);
    } catch (error) {
      console.error('Error reading jobs.json:', error);
      currentJobs = [];
    }
    
    // Filter out any existing sample jobs (those with IDs 1-5)
    const sampleJobIds = ['1', '2', '3', '4', '5'];
    const filteredJobs = currentJobs.filter(job => !sampleJobIds.includes(job.id));
    console.log(`Removed ${currentJobs.length - filteredJobs.length} sample jobs`);
    
    // Add the new internships
    const updatedJobs = [...filteredJobs, ...houstonInternships];
    
    // Write the updated jobs back to the file
    await writeFile(jobsFilePath, JSON.stringify(updatedJobs, null, 2));
    
    console.log(`Successfully updated jobs.json with ${houstonInternships.length} real Houston internships`);
    console.log(`Total jobs in jobs.json: ${updatedJobs.length}`);
    
    return true;
  } catch (error) {
    console.error('Error updating jobs.json:', error);
    return false;
  }
}

// Run the script
console.log('Starting script execution...');
updateJobsJson()
  .then(() => console.log('Script execution completed'))
  .catch(error => console.error('Script execution failed:', error));
