# Team 2: Alumni API Contracts

**Base Path:** `/api/v1`
**Response Envelope:**
```json
{ "success": true, "data": {} }
```

## 1. Alumni Profile
### GET `/alumni/directory`
- **Purpose:** Students/TPO view alumni directory.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`, `TPO`, `ALUMNI`, `FACULTY`
- **Permission:** `alumni.directory.read`
- **Privacy Constraint:** Never expose general private student records. Only display public profile information (Graduation year, Company, Role, LinkedIn).

### GET `/alumni/profile/me`
- **Purpose:** Alumni views their own profile.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.profile.read.self`

### PUT `/alumni/profile/me`
- **Purpose:** Alumni updates their career details.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.profile.write.self`

## 2. Mentorship
### POST `/alumni/mentorship/request`
- **Purpose:** Student requests mentorship from an alumni.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `alumni.mentorship.request`
- **Request Body:** `{ alumniId: string, message: string }`

### PATCH `/alumni/mentorship/requests/:id`
- **Purpose:** Alumni accepts or rejects mentorship.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.mentorship.respond`
- **Request Body:** `{ status: "ACCEPTED" | "REJECTED" }`

### POST `/alumni/mentorship/sessions`
- **Purpose:** Schedule a mentorship meeting.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.mentorship.schedule`
- **Request Body:** `{ requestId: string, scheduledAt: string, meetingLink: string }`

## 3. Mock Interview & Resume Review Workflow (AI & Alumni)
### POST `/alumni/mock-interviews/ai/start`
- **Purpose:** Student starts an AI mock interview.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.mockinterview.execute`
- **Team 3 Dependency:** Triggers `POST /ai/interview/start` in Team 3 AI service.

### POST `/alumni/mock-interviews/ai/evaluate`
- **Purpose:** Complete and evaluate an AI mock interview.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Team 3 Dependency:** Triggers `POST /ai/interview/evaluate` in Team 3 AI service.

### POST `/alumni/mock-interviews/request`
- **Purpose:** Request a live mock interview from an Alumni.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `alumni.mockinterview.request`

### POST `/alumni/resumes/review-request`
- **Purpose:** Request a human resume review from an Alumni.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `alumni.resumereview.request`
- **Request Body:** `{ alumniId: string, resumeId: string, message: string }`

## 4. Alumni Opportunities, Referrals & Industry Insights
### POST `/alumni/opportunities`
- **Purpose:** Alumni posts a job opportunity at their company.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.opportunity.create`
- **Request Body:** `{ title: string, description: string, applicationLink: string }`

### POST `/alumni/opportunities/:id/referral-request`
- **Purpose:** Student requests a referral for an alumni opportunity.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `alumni.referral.request`

### PATCH `/alumni/referrals/:id`
- **Purpose:** Alumni manages a referral request.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.referral.manage`
- **Request Body:** `{ status: "REFERRED" | "DECLINED" }`

### POST `/alumni/insights`
- **Purpose:** Alumni shares industry insights, trends, or interview tips.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`
- **Permission:** `alumni.insight.create`
- **Request Body:** `{ title: string, content: string, tags: string[] }`

## 5. Alumni Events
### GET `/alumni/events`
- **Purpose:** List upcoming alumni events.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`, `ALUMNI`, `TPO`, `FACULTY`
- **Permission:** `alumni.event.read`

### POST `/alumni/events`
- **Purpose:** Create an alumni networking event or webinar.
- **Authentication:** Required
- **Allowed Roles:** `ALUMNI`, `TPO`
- **Permission:** `alumni.event.create`
- **Request Body:** `{ title: string, description: string, date: string, location: string }`
