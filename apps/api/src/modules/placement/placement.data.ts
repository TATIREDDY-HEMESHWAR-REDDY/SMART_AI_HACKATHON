
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const PlacementData = {
  createCompany: async (data: any) => {
    return prisma.company.create({
      data: {
        name: data.name,
        website: data.website,
        industry: data.industry,
        verificationStatus: 'REGISTERED'
      }
    });
  },

  verifyCompany: async (id: string, status: string) => {
    return prisma.company.update({
      where: { id },
      data: { verificationStatus: status }
    });
  },

  getRecruiterMe: async (userId: string) => {
    let recruiter = await prisma.recruiter.findUnique({ where: { userId } });
    if (!recruiter) {
      // Find a default company or fail gracefully
      const defaultCompany = await prisma.company.findFirst();
      if (!defaultCompany) throw new Error('No company found to assign recruiter');
      
      recruiter = await prisma.recruiter.create({
        data: {
          userId,
          companyId: defaultCompany.id,
          designation: 'Recruiter',
          isVerified: false
        }
      });
    }
    return recruiter;
  },

  createDrive: async (data: any) => {
    return prisma.placementDrive.create({
      data: {
        title: data.title,
        description: data.description,
        registrationDeadline: new Date(data.registrationDeadline),
        companyId: data.companyId,
        status: 'PUBLISHED'
      }
    });
  },

  createJob: async (driveId: string, data: any) => {
    const job = await prisma.job.create({
      data: {
        driveId,
        title: data.title,
        packageDetails: data.packageDetails,
        location: data.location,
      }
    });
    
    if (data.eligibility) {
      await prisma.eligibilityRule.create({
        data: {
          jobId: job.id,
          minCgpa: data.eligibility.minCgpa,
          allowedBranches: data.eligibility.allowedBranches,
          maxBacklogs: data.eligibility.maxBacklogs
        }
      });
    }
    return job;
  },
  
  getCompanies: async () => prisma.company.findMany(),
  getDrives: async () => prisma.placementDrive.findMany(),
  getJobs: async () => prisma.job.findMany({ include: { eligibility: true } })
};

