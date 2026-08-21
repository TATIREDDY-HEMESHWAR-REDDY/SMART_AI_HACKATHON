import { randomUUID } from 'crypto';

// Isolated mock data layer to avoid Prisma schema issues

interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  status: string;
  createdAt: string;
}

interface Drive {
  id: string;
  companyId: string;
  title: string;
  description: string;
  registrationDeadline: string;
  createdAt: string;
}

interface Job {
  id: string;
  driveId: string;
  title: string;
  packageDetails: string;
  location: string;
  eligibility: {
    minCgpa: number;
    allowedBranches: string[];
    maxBacklogs: number;
  };
  createdAt: string;
}

interface RecruiterProfile {
  id: string;
  userId: string;
  companyId: string | null;
  designation: string;
  isVerified: boolean;
}

const companies: Company[] = [];
const drives: Drive[] = [];
const jobs: Job[] = [];
const recruiters: RecruiterProfile[] = [];

export const PlacementData = {
  createCompany: (data: any) => {
    const company = {
      id: randomUUID(),
      ...data,
      status: 'REGISTERED',
      createdAt: new Date().toISOString()
    };
    companies.push(company);
    return company;
  },

  verifyCompany: (id: string, status: string) => {
    const company = companies.find(c => c.id === id);
    if (!company) return null;
    company.status = status;
    return company;
  },

  getRecruiterMe: (userId: string) => {
    let recruiter = recruiters.find(r => r.userId === userId);
    if (!recruiter) {
      recruiter = {
        id: randomUUID(),
        userId,
        companyId: null,
        designation: 'Recruiter',
        isVerified: false
      };
      recruiters.push(recruiter);
    }
    return recruiter;
  },

  createDrive: (data: any) => {
    const drive = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString()
    };
    drives.push(drive);
    return drive;
  },

  createJob: (driveId: string, data: any) => {
    const job = {
      id: randomUUID(),
      driveId,
      ...data,
      createdAt: new Date().toISOString()
    };
    jobs.push(job);
    return job;
  },
  
  getCompanies: () => companies,
  getDrives: () => drives,
  getJobs: () => jobs
};
