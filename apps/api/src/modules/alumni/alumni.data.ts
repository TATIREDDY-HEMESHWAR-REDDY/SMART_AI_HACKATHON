import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class AlumniDataStore {
  async getDirectory() {
    return prisma.alumniProfile.findMany({
      include: { 
        user: { 
          include: { 
            studentProfile: true 
          } 
        } 
      }
    });
  }

  async getProfileByUserId(userId: string) {
    return prisma.alumniProfile.findUnique({
      where: { userId },
      include: { 
        user: { 
          include: { 
            studentProfile: true 
          } 
        } 
      }
    });
  }

  async updateProfile(userId: string, data: any) {
    const existing = await prisma.alumniProfile.findUnique({ where: { userId } });
    if (!existing) {
      return prisma.alumniProfile.create({
        data: {
          userId,
          graduationYear: data.graduationYear || new Date().getFullYear(),
          currentCompany: data.currentCompany,
          currentRole: data.currentRole,
          linkedInUrl: data.linkedInUrl,
          expertise: data.expertise || []
        }
      });
    }
    return prisma.alumniProfile.update({
      where: { userId },
      data: {
        graduationYear: data.graduationYear,
        currentCompany: data.currentCompany,
        currentRole: data.currentRole,
        linkedInUrl: data.linkedInUrl,
        expertise: data.expertise
      }
    });
  }

  async createMentorshipRequest(studentId: string, alumniId: string, message: string) {
    return prisma.mentorshipRequest.create({
      data: { studentId, alumniId, message, status: 'PENDING' }
    });
  }

  async updateMentorshipRequestStatus(requestId: string, status: string) {
    return prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status }
    });
  }

  async createMentorshipSession(requestId: string, scheduledAt: string, meetingLink: string) {
    return prisma.mentorshipSession.create({
      data: { requestId, scheduledAt: new Date(scheduledAt), meetingLink }
    });
  }

  async createEvent(creatorId: string, title: string, description: string, date: string, location: string) {
    return prisma.alumniEvent.create({
      data: { title, description, date: new Date(date), location }
    });
  }

  async getEvents() {
    return prisma.alumniEvent.findMany({ orderBy: { date: 'asc' } });
  }
}

export const alumniData = new AlumniDataStore();
