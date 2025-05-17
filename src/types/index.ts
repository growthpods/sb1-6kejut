export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  type: 'Full-Time' | 'Part-Time' | 'Remote';
  level: 'Entry Level' | 'Intermediate' | 'Expert';
  timeCommitment?: 'Evening' | 'Weekend' | 'Summer';
  applicants: number;
  postedAt: Date;
  externalLink?: string;
  applicationUrl?: string;
  companyLogo?: string;
  source?: 'supabase' | 'google' | 'RapidAPI'; // Source of the job listing
  careerSiteUrl?: string; // Added for company's career page
}

export interface User {
  id: string;
  email: string;
  name?: string;
  company?: string;
  isEmployer: boolean;
  linkedinProfile?: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  education: string;
  skills: string[];
  experience: string[];
  avatar_url?: string;
  availability?: string;
  graduationYear?: number;
  major?: string;
  gpa?: number;
  bio?: string;
}
