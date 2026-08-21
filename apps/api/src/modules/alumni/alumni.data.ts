import { randomUUID } from 'crypto';

export interface AlumniProfileData {
  id: string;
  userId: string;
  name: string; // Included for convenience in UI, fetched from user in a real scenario
  graduationYear: number;
  currentCompany?: string;
  currentRole?: string;
  linkedInUrl?: string;
  expertise: string[];
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface MentorshipSession {
  id: string;
  requestId: string;
  scheduledAt: string;
  meetingLink: string;
}

export interface AlumniEvent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

class AlumniDataStore {
  private profiles: AlumniProfileData[] = [
    {
      id: randomUUID(),
      userId: 'mock-alumni-1-id',
      name: 'Alice Johnson',
      graduationYear: 2021,
      currentCompany: 'Tech Corp',
      currentRole: 'Senior Software Engineer',
      linkedInUrl: 'https://linkedin.com/in/alice',
      expertise: ['React', 'Node.js', 'System Design'],
    },
    {
      id: randomUUID(),
      userId: 'mock-alumni-2-id',
      name: 'Bob Smith',
      graduationYear: 2019,
      currentCompany: 'Data Inc',
      currentRole: 'Data Scientist',
      linkedInUrl: 'https://linkedin.com/in/bob',
      expertise: ['Python', 'Machine Learning', 'Data Analysis'],
    },
  ];

  getDirectory(): AlumniProfileData[] {
    return this.profiles;
  }

  getProfileByUserId(userId: string): AlumniProfileData | undefined {
    return this.profiles.find((p) => p.userId === userId);
  }

  updateProfile(userId: string, data: Partial<AlumniProfileData>): AlumniProfileData {
    let profile = this.getProfileByUserId(userId);
    if (!profile) {
      // Create if doesn't exist for the user (mock behavior)
      profile = {
        id: randomUUID(),
        userId,
        name: 'Current User', // Placeholder
        graduationYear: new Date().getFullYear(),
        expertise: [],
        ...data,
      };
      this.profiles.push(profile);
    } else {
      Object.assign(profile, data);
    }
    return profile;
  }

  // --- Mentorship Data Methods ---
  private mentorshipRequests: MentorshipRequest[] = [];
  private mentorshipSessions: MentorshipSession[] = [];

  createMentorshipRequest(studentId: string, alumniId: string, message: string): MentorshipRequest {
    const req: MentorshipRequest = {
      id: randomUUID(),
      studentId,
      alumniId,
      message,
      status: 'PENDING'
    };
    this.mentorshipRequests.push(req);
    return req;
  }

  updateMentorshipRequestStatus(requestId: string, status: 'ACCEPTED' | 'REJECTED'): MentorshipRequest | null {
    const req = this.mentorshipRequests.find(r => r.id === requestId);
    if (!req) return null;
    req.status = status;
    return req;
  }

  createMentorshipSession(requestId: string, scheduledAt: string, meetingLink: string): MentorshipSession {
    const session: MentorshipSession = {
      id: randomUUID(),
      requestId,
      scheduledAt,
      meetingLink
    };
    this.mentorshipSessions.push(session);
    return session;
  }

  // --- Events Data Methods ---
  private events: AlumniEvent[] = [];

  createEvent(creatorId: string, title: string, description: string, date: string, location: string): AlumniEvent {
    const event: AlumniEvent = {
      id: randomUUID(),
      creatorId,
      title,
      description,
      date,
      location
    };
    this.events.push(event);
    return event;
  }

  getEvents(): AlumniEvent[] {
    return this.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const alumniData = new AlumniDataStore();
