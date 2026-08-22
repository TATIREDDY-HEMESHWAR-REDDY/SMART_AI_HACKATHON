import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const PlacementData = {
  createCompany: async (data: any) => {
    return prisma.company.create({
      data: {
        name: data.name,
        website: data.website,
        industry: data.industry,
        verificationStatus: 'PENDING_VERIFICATION' // Changed for Module S
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
    return prisma.recruiter.findUnique({ 
      where: { userId },
      include: { company: true }
    });
  },

  onboardRecruiter: async (userId: string, data: { companyId: string, designation: string }) => {
    return prisma.recruiter.create({
      data: {
        userId,
        companyId: data.companyId,
        designation: data.designation,
        isVerified: false
      }
    });
  },

  getPendingApprovals: async () => {
    const companies = await prisma.company.findMany({
      where: { verificationStatus: 'PENDING_VERIFICATION' }
    });
    const recruiters = await prisma.recruiter.findMany({
      where: { isVerified: false },
      include: { company: true, user: true }
    });
    return { companies, recruiters };
  },

  verifyRecruiter: async (id: string) => {
    return prisma.recruiter.update({
      where: { id },
      data: { isVerified: true }
    });
  },

  createDrive: async (data: any) => {
    return prisma.placementDrive.create({
      data: {
        title: data.title,
        description: data.description,
        registrationDeadline: new Date(data.registrationDeadline),
        companyId: data.companyId,
        status: 'DRAFT'
      }
    });
  },

  createJob: async (driveId: string, data: any) => {
    const job = await prisma.job.create({
      data: {
        driveId,
        title: data.title,
        description: data.description || null,
        packageDetails: data.packageDetails,
        location: data.location,
        skills: data.skills || [],
        selectionSteps: data.selectionSteps || []
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
  getJobs: async () => prisma.job.findMany({ include: { eligibility: true } }),

  checkEligibility: async (jobId: string, studentId: string) => {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { eligibility: true } });
    if (!job) throw new Error('Job not found');

    const student = await prisma.studentProfile.findUnique({ 
      where: { id: studentId },
      include: { program: { include: { department: true } } } 
    });
    if (!student) throw new Error('Student not found');

    const rule = job.eligibility;
    if (!rule) {
      return { isEligible: true, criteria: [] }; // No specific rules
    }

    const criteria = [];
    let isEligible = true;

    // 1. CGPA
    const cgpaPass = student.cgpa >= rule.minCgpa;
    criteria.push({ name: 'CGPA Minimum', required: rule.minCgpa, actual: student.cgpa, passed: cgpaPass });
    if (!cgpaPass) isEligible = false;

    // 2. Branch
    const branchName = student.program.name; 
    let branchPass = false;
    if (rule.allowedBranches.length === 0 || rule.allowedBranches.includes('ALL')) {
        branchPass = true;
    } else {
        branchPass = rule.allowedBranches.some(b => branchName.toLowerCase().includes(b.toLowerCase()) || student.program.department?.name.toLowerCase().includes(b.toLowerCase()));
    }
    criteria.push({ name: 'Allowed Branch', required: rule.allowedBranches.join(', ') || 'Any', actual: branchName, passed: branchPass });
    if (!branchPass) isEligible = false;

    // 3. Backlogs
    const backlogsPass = student.activeBacklogs <= rule.maxBacklogs;
    criteria.push({ name: 'Max Backlogs', required: rule.maxBacklogs, actual: student.activeBacklogs, passed: backlogsPass });
    if (!backlogsPass) isEligible = false;

    // 4. Required Skills
    let skillsPass = true;
    let actualSkills = student.skills || [];
    if (job.skills && job.skills.length > 0) {
        const missingSkills = job.skills.filter(s => !actualSkills.map(a => a.toLowerCase()).includes(s.toLowerCase()));
        if (missingSkills.length > 0) {
            skillsPass = false;
            criteria.push({ name: 'Required Skills', required: job.skills.join(', '), actual: 'Missing: ' + missingSkills.join(', '), passed: false });
        } else {
            criteria.push({ name: 'Required Skills', required: job.skills.join(', '), actual: 'Matches all', passed: true });
        }
    }
    if (!skillsPass) isEligible = false;

    return { isEligible, criteria };
  }
};
