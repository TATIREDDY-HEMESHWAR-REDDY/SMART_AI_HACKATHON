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
}

export const alumniData = new AlumniDataStore();
