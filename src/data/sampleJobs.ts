import type { Job } from '../types';

export const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Accounting Intern',
    company: 'Innospec Inc.',
    location: 'The Woodlands, TX 77381',
    description: 'Innospec Oilfield Services Position: Accounting Intern. Duration of Internship: 8-10 weeks. Hours: 30-40 hours a week Monday to Friday.',
    requirements: [
      'Currently pursuing a degree in Accounting or Finance',
      'Strong analytical skills',
      'Proficiency in Excel',
      'Attention to detail'
    ],
    type: 'Full-Time',
    level: 'Entry Level',
    applicants: 12,
    postedAt: new Date('2025-03-30'),
    companyLogo: 'https://ui-avatars.com/api/?name=Innospec'
  },
  {
    id: '2',
    title: 'Data Analyst Intern (Summer 2025)',
    company: 'Johnson Law Group',
    location: 'Houston, TX 77098',
    description: 'Looking for a fast paced, hands-on, in-person summer internship? Look no further. Johnson Law Group is an international plaintiffs\' law firm located in Houston seeking a data analyst intern.',
    requirements: [
      'Experience with data analysis tools',
      'Strong problem-solving abilities',
      'Knowledge of SQL is a plus',
      'Attention to detail'
    ],
    type: 'Full-Time',
    level: 'Entry Level',
    applicants: 24,
    postedAt: new Date('2025-04-01'),
    companyLogo: 'https://ui-avatars.com/api/?name=Johnson'
  },
  {
    id: '3',
    title: 'Administrative & Compliance Intern',
    company: 'Team Industry',
    location: 'Carrollton, TX 75006',
    description: 'Industry is seeking a detail-oriented Administrative Intern to assist with auditing profiles in our Applicant Tracking System (ATS) and managing compliance.',
    requirements: [
      'Strong organizational skills',
      'Attention to detail',
      'Proficiency in Microsoft Office',
      'Ability to handle confidential information'
    ],
    type: 'Part-Time',
    level: 'Entry Level',
    applicants: 5,
    postedAt: new Date('2025-04-02'),
    companyLogo: 'https://ui-avatars.com/api/?name=Team'
  },
  {
    id: '4',
    title: 'Creative Tech Summer Lead Counselor',
    company: 'Creator Camp',
    location: 'Austin, TX 78756',
    description: 'Apply via our website for PRIORITY consideration: https://www.creatorcamp.org/join-our-team. What is Creator Camp? As seen on Shark Tank, we are a tech education company focused on teaching kids coding, robotics, and game design.',
    requirements: [
      'Experience working with children',
      'Knowledge of coding or game design',
      'Strong communication skills',
      'Creative problem-solving abilities'
    ],
    type: 'Full-Time',
    level: 'Intermediate',
    applicants: 18,
    postedAt: new Date('2025-04-01'),
    companyLogo: 'https://ui-avatars.com/api/?name=Creator'
  },
  {
    id: '5',
    title: 'Summer Intern Data Analytics',
    company: 'Coca-Cola Southwest Beverages',
    location: 'Dallas, TX 75240',
    description: 'Dates: May 27 - August 8, 2025 subject to change. 25 Hours per week. Compensation: $22.00 per hour. Company Overview: Coca-Cola Southwest Beverages, a company with a rich history in the beverage industry.',
    requirements: [
      'Currently pursuing a degree in Data Science, Statistics, or related field',
      'Experience with data visualization tools',
      'Strong analytical skills',
      'Proficiency in Excel and SQL'
    ],
    type: 'Part-Time',
    level: 'Entry Level',
    applicants: 35,
    postedAt: new Date('2025-03-25'),
    companyLogo: 'https://ui-avatars.com/api/?name=Coca-Cola'
  }
];
