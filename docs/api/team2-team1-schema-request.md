# Team 2: Schema Request to Team 1

This document outlines the database schema requirements for Team 2 (Career, Placement, Alumni). Since Team 1 owns the canonical `prisma/schema.prisma` file, we are providing the entity definitions, relationships, and constraints here so Team 1 can integrate them.

## 1. Global Dependencies
All Team 2 entities rely on the global `User.id` and `StudentProfile.id` provided by Team 1.
We assume Team 1 handles authentication, RBAC (roles/permissions), and the core institution schema.

## 2. Career Entities

### 2.1 Skill
**Purpose:** Global catalog of skills available for students to learn or required by jobs.
**Fields:**
- `id` (UUID, PK)
- `name` (String, Unique)
- `category` (String) - e.g., "Technical", "Soft", "Domain"
- `description` (String, Optional)
- `createdAt`, `updatedAt`

### 2.2 StudentSkill
**Purpose:** Maps a student to a skill, including proficiency and verification.
**Fields:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `skillId` (UUID, FK to Skill)
- `proficiencyLevel` (Enum: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `isVerified` (Boolean, default: false)
**Uniqueness:** `[studentId, skillId]`

### 2.3 CareerGoal
**Purpose:** Stores a student's career aspirations to guide recommendations.
**Fields:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile, Unique per student or one-to-many depending on business logic - let's make it one-to-many to keep history, but flag one as `isActive`)
- `targetRole` (String)
- `targetIndustry` (String)
- `isActive` (Boolean)

### 2.4 CareerAssessment & AssessmentResult
**Purpose:** Orchestrates AI-driven career assessments.
**CareerAssessment:**
- `id` (UUID, PK)
- `title` (String)
- `description` (String)
**AssessmentResult:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `assessmentId` (UUID, FK to CareerAssessment)
- `score` (Float)
- `aiFeedback` (JSON)
- `createdAt`

### 2.5 CareerRecommendation, LearningResource & ProjectSuggestion
**Purpose:** AI-generated recommendations based on skills and goals.
**CareerRecommendation:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `recommendedRole` (String)
- `matchPercentage` (Float)
- `rationale` (String)
**LearningResource:**
- `id` (UUID, PK)
- `title` (String)
- `url` (String)
- `type` (String)
**ProjectSuggestion:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `title` (String)
- `description` (String)
- `difficulty` (String)

### 2.6 Resume & ResumeAnalysis
**Purpose:** Manages student resumes and AI-driven analysis.
**Resume:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `fileUrl` (String)
- `isPrimary` (Boolean)
- `createdAt`, `updatedAt`
**ResumeAnalysis:**
- `id` (UUID, PK)
- `resumeId` (UUID, FK to Resume, Unique)
- `atsScore` (Float)
- `feedback` (JSON) - strengths, improvements
- `analyzedAt` (DateTime)

## 3. Placement Entities

### 3.1 Company
**Purpose:** Represents a recruiter's company.
**Fields:**
- `id` (UUID, PK)
- `name` (String)
- `website` (String)
- `industry` (String)
- `verificationStatus` (Enum: REGISTERED, PENDING_VERIFICATION, VALIDATING, VERIFIED, ACTIVE)
**Uniqueness:** `name` (or registration number)

### 3.2 Recruiter
**Purpose:** Recruiter profile linked to a User and a Company.
**Fields:**
- `id` (UUID, PK)
- `userId` (UUID, FK to User, Unique)
- `companyId` (UUID, FK to Company)
- `designation` (String)
- `isVerified` (Boolean)

### 3.3 PlacementDrive
**Purpose:** Represents a hiring event organized by the TPO.
**Fields:**
- `id` (UUID, PK)
- `companyId` (UUID, FK to Company)
- `title` (String)
- `description` (String)
- `status` (Enum: DRAFT, PUBLISHED, ONGOING, COMPLETED)
- `registrationDeadline` (DateTime)

### 3.4 Job & EligibilityRule
**Purpose:** Specific roles offered in a drive and their criteria.
**Job:**
- `id` (UUID, PK)
- `driveId` (UUID, FK to PlacementDrive)
- `title` (String)
- `packageDetails` (String/JSON)
- `location` (String)
**EligibilityRule:**
- `id` (UUID, PK)
- `jobId` (UUID, FK to Job, Unique)
- `minCgpa` (Float)
- `allowedBranches` (String[])
- `maxBacklogs` (Int)

### 3.5 JobApplication
**Purpose:** Tracks a student's application to a job.
**Fields:**
- `id` (UUID, PK)
- `jobId` (UUID, FK to Job)
- `studentId` (UUID, FK to StudentProfile)
- `resumeId` (UUID, FK to Resume)
- `status` (Enum: APPLIED, UNDER_REVIEW, SHORTLISTED, ASSESSMENT, INTERVIEW, SELECTED, REJECTED, WAITLISTED, WITHDRAWN)
- `assessmentScore` (Float, Optional)
- `assessmentFeedback` (String, Optional)
**Uniqueness:** `[jobId, studentId]`

### 3.6 Shortlist, Interview & SelectionResult
**Purpose:** Tracks the progression of an application.
**Shortlist:**
- `id` (UUID, PK)
- `applicationId` (UUID, FK to JobApplication, Unique)
- `roundNumber` (Int)
**Interview:**
- `id` (UUID, PK)
- `applicationId` (UUID, FK to JobApplication)
- `scheduledAt` (DateTime)
- `type` (String)
- `feedback` (String)
**SelectionResult:**
- `id` (UUID, PK)
- `applicationId` (UUID, FK to JobApplication, Unique)
- `offerLetterUrl` (String, Optional)
- `accepted` (Boolean, Optional)

## 4. Alumni Entities

### 4.1 AlumniProfile
**Purpose:** Profile for an alumni.
**Fields:**
- `id` (UUID, PK)
- `userId` (UUID, FK to User, Unique)
- `graduationYear` (Int)
- `currentCompany` (String, Optional)
- `currentRole` (String, Optional)
- `linkedInUrl` (String, Optional)
- `expertise` (String[])

### 4.2 MentorshipRequest & MentorshipSession
**Purpose:** Facilitates mentorship between alumni and students.
**MentorshipRequest:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `alumniId` (UUID, FK to AlumniProfile)
- `status` (Enum: PENDING, ACCEPTED, REJECTED)
- `message` (String)
**MentorshipSession:**
- `id` (UUID, PK)
- `requestId` (UUID, FK to MentorshipRequest)
- `scheduledAt` (DateTime)
- `meetingLink` (String)

### 4.3 AlumniOpportunity & Referral
**Purpose:** Job opportunities or referrals posted by alumni.
**AlumniOpportunity:**
- `id` (UUID, PK)
- `alumniId` (UUID, FK to AlumniProfile)
- `title` (String)
- `description` (String)
- `applicationLink` (String)
- `isActive` (Boolean)
**Referral:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `opportunityId` (UUID, FK to AlumniOpportunity)
- `status` (Enum: REQUESTED, REFERRED, DECLINED)

### 4.4 AlumniEvent
**Purpose:** Events hosted for or by alumni.
**Fields:**
- `id` (UUID, PK)
- `title` (String)
- `description` (String)
- `date` (DateTime)
- `location` (String)

## 5. Mock Interview
**MockInterview & MockInterviewSession:**
- `id` (UUID, PK)
- `studentId` (UUID, FK to StudentProfile)
- `type` (String) - e.g., "AI", "Alumni"
- `status` (Enum: SCHEDULED, COMPLETED)
- `feedback` (JSON)
- `aiSessionId` (String, reference to AI service ID)

## Indexes & Constraints
- Ensure proper foreign key constraints with `onDelete: Cascade` or `Restrict` as per business logic.
- Index `studentId` heavily on `JobApplication`, `StudentSkill`, `Resume`.
- Index `companyId` on `PlacementDrive`, `Recruiter`.
- Unique constraints where noted above.
