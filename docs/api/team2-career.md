# Team 2: Career API Contracts

**Base Path:** `/api/v1`
**Response Envelope:**
```json
{ "success": true, "data": {} }
```
```json
{ "success": false, "error": { "code": "...", "message": "...", "details": {} } }
```

## 1. Career Profile
### GET `/career/profile/me`
- **Purpose:** Fetch the current student's career profile (goals, summary).
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.profile.read.self`
- **Response:** `CareerGoal` entities linked to the student.
- **Relevant Entity:** `CareerGoal`

### POST `/career/profile/me`
- **Purpose:** Update the student's career profile and aspirations.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.profile.write.self`
- **Request Body:** `{ targetRole: string, targetIndustry: string }`
- **Validation:** Must be valid strings.

## 2. Skills / Skill Catalog
### GET `/career/skills`
- **Purpose:** Retrieve the global catalog of skills.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`, `TPO`, `RECRUITER`, `ALUMNI`, `FACULTY`
- **Permission:** `career.skills.read`
- **Request Parameters:** `?category=Technical`
- **Response:** List of `Skill` entities.

### GET `/career/skills/me`
- **Purpose:** Retrieve skills mapped to the current student.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.skills.read.self`
- **Response:** List of `StudentSkill` mapped to `Skill`.

### POST `/career/skills/me`
- **Purpose:** Add a skill to the student's profile.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.skills.write.self`
- **Request Body:** `{ skillId: string, proficiencyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" }`
- **Validation:** valid UUID, valid enum.

## 3. Career Assessment
### GET `/career/assessments`
- **Purpose:** Fetch available career assessments.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`, `TPO`
- **Permission:** `career.assessment.read`

### POST `/career/assessments/start`
- **Purpose:** Initialize an AI-driven career assessment.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.assessment.execute`
- **Request Body:** `{ assessmentId: string }`
- **Team 3 Dependency:** Triggers `POST /ai/career/assessment` in Team 3 AI service.

### GET `/career/assessments/me/results`
- **Purpose:** Fetch the results of past assessments.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.assessment.results.read.self`
- **Response:** List of `AssessmentResult`.

### GET `/career/readiness/me`
- **Purpose:** Fetch the overall career readiness score and metrics.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.readiness.read.self`

## 4. Skill Gap, Roadmap & Recommendations
### GET `/career/roadmap/me`
- **Purpose:** Fetch AI-generated career roadmap, skill gap analysis, learning resources, and project suggestions based on goals and current skills.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.roadmap.read.self`
- **Team 3 Dependency:** Uses `POST /ai/career/roadmap` asynchronously or cached.
- **Response:** `CareerRecommendation`, `LearningResource`, and project suggestion list.

### POST `/career/recommendations/:id/explain`
- **Purpose:** Request AI to explain why a specific career recommendation was made.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.recommendation.explain`
- **Team 3 Dependency:** Triggers `POST /ai/explain/recommendation` in Team 3 AI service.

## 5. Resume & Versions
### GET `/career/resumes/me`
- **Purpose:** List student's uploaded resumes and primary version.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.resume.read.self`

### GET `/career/resumes/me/versions`
- **Purpose:** Fetch history of all uploaded resume versions for the student.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.resume.read.self`

### POST `/career/resumes/me`
- **Purpose:** Upload a new resume version (PDF).
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.resume.write.self`
- **Request Body:** `multipart/form-data` with `fileUrl` (after storage upload).
- **Team 1 Dependency:** Uses shared storage service/upload abstraction.

## 6. Resume Analysis Integration
### POST `/career/resumes/:resumeId/analyze`
- **Purpose:** Request ATS-style AI analysis of a resume version.
- **Authentication:** Required
- **Allowed Roles:** `STUDENT`
- **Permission:** `career.resume.analyze`
- **Team 3 Dependency:** Triggers `POST /ai/resume/analyze` in Team 3 AI service.
- **Response:** `ResumeAnalysis` entity data (ATS score, detailed strengths, improvement areas).

## 7. Career Analytics
### GET `/career/analytics/dashboard`
- **Purpose:** View aggregate career readiness, popular skills, and top goals.
- **Authentication:** Required
- **Allowed Roles:** `TPO`, `FACULTY`
- **Permission:** `career.analytics.read`

## Privacy Constraints
- Students can only read/write their own skills, goals, resumes, and assessments.
- TPOs can view aggregate skill data but require `tpo.student.read` permission to view individual student profiles.
- Resumes are private unless submitted to a JobApplication.
