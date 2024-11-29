import type { Job } from '../types';

export const SAMPLE_JOBS: Job[] = [
  // Existing jobs...
  {
    id: '13',
    title: 'Machine Learning Research Intern',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    description: "Join OpenAI's research team to work on cutting-edge AI models and contribute to advancing artificial intelligence in a safe and beneficial way.",
    requirements: ['Strong ML/AI background', 'Python expertise', 'Research experience'],
    type: 'Full-Time',
    level: 'Expert',
    applicants: 245,
    postedAt: new Date('2024-02-25'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg'
  },
  {
    id: '14',
    title: 'Sustainability Intern',
    company: 'Tesla',
    location: 'Austin, TX',
    description: "Work with Tesla's sustainability team to analyze and improve environmental impact across manufacturing and operations.",
    requirements: ['Environmental Science major', 'Data analysis skills', 'Passion for sustainability'],
    type: 'Full-Time',
    level: 'Entry Level',
    applicants: 167,
    postedAt: new Date('2024-02-24'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png'
  },
  {
    id: '15',
    title: 'Game Development Intern',
    company: 'Electronic Arts',
    location: 'Redwood City, CA',
    description: "Join EA's game development team to work on upcoming titles, focusing on gameplay mechanics and optimization.",
    requirements: ['Game development experience', 'C++ or Unity', '3D mathematics'],
    type: 'Full-Time',
    level: 'Intermediate',
    applicants: 189,
    postedAt: new Date('2024-02-23'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Electronic-Arts-Logo.svg'
  },
  {
    id: '16',
    title: 'Cybersecurity Intern',
    company: 'Palantir',
    location: 'Denver, CO',
    description: "Work alongside Palantir's security team to identify and address potential vulnerabilities in our systems.",
    requirements: ['Security fundamentals', 'Programming skills', 'Network knowledge'],
    type: 'Full-Time',
    level: 'Entry Level',
    applicants: 134,
    postedAt: new Date('2024-02-25'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Palantir_Technologies_logo.svg'
  },
  {
    id: '17',
    title: 'Quantum Computing Intern',
    company: 'IBM',
    location: 'Yorktown Heights, NY',
    description: "Join IBM Quantum to work on quantum algorithms and contribute to the future of computing.",
    requirements: ['Quantum mechanics knowledge', 'Python/Qiskit', 'Linear algebra'],
    type: 'Full-Time',
    level: 'Expert',
    applicants: 98,
    postedAt: new Date('2024-02-24'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
  },
  {
    id: '18',
    title: 'Robotics Engineering Intern',
    company: 'Boston Dynamics',
    location: 'Waltham, MA',
    description: "Work on next-generation robotics systems, focusing on mobility, perception, and control systems.",
    requirements: ['Robotics experience', 'C++/Python', 'Control systems'],
    type: 'Full-Time',
    level: 'Intermediate',
    applicants: 156,
    postedAt: new Date('2024-02-23'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Boston_Dynamics_logo.svg'
  },
  {
    id: '19',
    title: 'Space Systems Intern',
    company: 'SpaceX',
    location: 'Hawthorne, CA',
    description: "Join SpaceX's mission to make humanity multiplanetary by working on spacecraft systems and launch vehicles.",
    requirements: ['Aerospace Engineering', 'CAD experience', 'Systems engineering'],
    type: 'Full-Time',
    level: 'Entry Level',
    applicants: 278,
    postedAt: new Date('2024-02-25'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/SpaceX-Logo-Xonly.svg'
  },
  {
    id: '20',
    title: 'Blockchain Development Intern',
    company: 'Coinbase',
    location: 'Remote, USA',
    description: "Work on cryptocurrency trading systems and blockchain infrastructure projects.",
    requirements: ['Blockchain knowledge', 'Smart contracts', 'Web3 development'],
    type: 'Remote',
    level: 'Intermediate',
    applicants: 145,
    postedAt: new Date('2024-02-24'),
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Coinbase_logo.svg'
  }
];