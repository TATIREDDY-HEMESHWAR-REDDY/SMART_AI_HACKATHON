# Team 2: Placement API Contracts

**Base Path:** `/api/v1`
**Response Envelope:**
```json
{ "success": true, "data": {} }
```

## 1. Company & Recruiter (TPO & Recruiter Workflows)
### POST `/placement/companies`
- **Purpose:** Register a new company for placement.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`, `TPO`
- **Permission:** `placement.company.create`
- **Request Body:** `{ name: string, website: string, industry: string }`
- **Validation:** Company name uniqueness check.

### PATCH `/placement/companies/:id/verify`
- **Purpose:** Update company verification status.
- **Authentication:** Required
- **Allowed Roles:** `TPO`
- **Permission:** `placement.company.verify`
- **Request Body:** `{ status: "REGISTERED" | "PENDING_VERIFICATION" | "VALIDATING" | "VERIFIED" | "ACTIVE" }`
- **Business Rule:** Only verified/active companies can host drives.

### GET `/placement/recruiters/me`
- **Purpose:** Recruiter dashboard profile.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`
- **Permission:** `placement.recruiter.read.self`

## 2. Placement Drive & Jobs (TPO Workflow)
### POST `/placement/drives`
- **Purpose:** TPO creates a new placement drive.
- **Authentication:** Required
- **Allowed Roles:** `TPO`
- **Permission:** `placement.drive.create`
- **Request Body:** `{ companyId: string, title: string, description: string, registrationDeadline: string }`

### POST `/placement/drives/:driveId/jobs`
- **Purpose:** Add a job to a drive and define deterministic eligibility.
- **Authentication:** Required
- **Allowed Roles:** `TPO`
- **Permission:** `placement.job.create`
- **Request Body:** 
  `{ title: string, packageDetails: string, location: string, eligibility: { minCgpa: number, allowedBranches: string[], maxBacklogs: number } }`
- **Validation:** Deterministic rules validation.

## 3. Student Application Workflow
### GET `/placement/drives/active`
- **Purpose:** Students view active drives.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `placement.drive.read`

### POST `/placement/jobs/:jobId/apply`
- **Purpose:** Student applies to a job.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `placement.application.create`
- **Request Body:** `{ resumeId: string }`
- **Business Rule:** Server MUST strictly evaluate eligibility (CGPA, Branch, Backlogs) before accepting the application. *LLMs are strictly forbidden from deciding eligibility.*

### GET `/placement/applications/me`
- **Purpose:** Student views their application statuses.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `placement.application.read.self`
- **Response:** Includes standard status enum (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, etc.)

## 4. Recruiter View & Shortlisting
### GET `/placement/jobs/:jobId/applications`
- **Purpose:** Recruiter views applicants for a job.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`, `TPO`
- **Permission:** `placement.application.read.company`
- **Privacy Constraint:** Recruiter ONLY sees approved fields (name, program, branch, CGPA, skills, resume). Fees, private data, and hostel complaints are strictly omitted.

### POST `/placement/applications/shortlist`
- **Purpose:** Recruiter shortlists candidates for the next round.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`, `TPO`
- **Permission:** `placement.candidate.shortlist`
- **Request Body:** `{ applicationIds: string[], roundNumber: number }`

## 5. Interviews, Assessment & Selection
### POST `/placement/applications/:id/assessment`
- **Purpose:** Record assessment stage results for an application.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`, `TPO`
- **Permission:** `placement.candidate.assess`
- **Request Body:** `{ score: number, feedback: string }`
- **Side Effect:** Updates application status to `ASSESSMENT`.

### POST `/placement/interviews`
- **Purpose:** Schedule an interview for an application.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`, `TPO`
- **Permission:** `placement.interview.schedule`

### POST `/placement/applications/:id/select`
- **Purpose:** Record final selection of a candidate.
- **Authentication:** Required
- **Allowed Roles:** `RECRUITER`, `TPO`
- **Permission:** `placement.candidate.select`
- **Request Body:** `{ offerLetterUrl?: string }`
- **Side Effect:** Updates application status to `SELECTED`. Explicitly triggers **Student Notification** and **TPO Notification**.

## 6. Placement Analytics
### GET `/placement/analytics/dashboard`
- **Purpose:** TPO views placement statistics.
- **Authentication:** Required
- **Allowed Roles:** `TPO`
- **Permission:** `placement.analytics.read`
- **Response:** Aggregation of selection rates, average packages, and top companies.
