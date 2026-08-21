# UNIFIED CAMPUS OS
## Frozen Developer Execution Specification & Master Build Plan

**Document status:** FROZEN FOR HACKATHON MVP  
**Purpose:** Single source of truth for the 3-person development team and all AI coding assistants  
**Reference institution:** VIT Chennai-style campus model, used only as a realistic reference  
**Target:** High-value, deployed web MVP for a software/AI hackathon  
**Team:** 3 students  
**Primary platform:** Web only for MVP  
**Future platform:** Android consuming the same backend APIs  
**Development model:** Monorepo, bounded modules, Git branches, contract-first integration  
**Database:** PostgreSQL + Prisma  
**Backend:** Node.js + TypeScript, modular monolith  
**AI service:** Python + FastAPI  
**Blockchain:** Real tamper-evident credential proof through a replaceable blockchain/ledger adapter  
**Deployment:** Zero-cost/free-tier oriented  
**Scope philosophy:** P0 first, then P1, then future expansion

---

# 0. EXECUTIVE DIRECTIVE

This file is the **frozen developer execution plan**.

A developer or AI coding assistant must not redesign the architecture while implementing features unless the team explicitly approves a new Architecture Decision Record (ADR).

The objective is not to build every imaginable ERP feature.

The objective is to build the **smallest technically honest, polished, connected, deployed system that convincingly solves the supplied problem statements**.

The product is one platform:

```text
                         UNIFIED CAMPUS OS
                                |
            +-------------------+-------------------+
            |                   |                   |
            v                   v                   v
      SMART CAMPUS       CAREER & PLACEMENT    DIGITAL CREDENTIALS
          ERP                    OS                   OS
            |                   |                   |
            +-------------------+-------------------+
                                |
                         SHARED PLATFORM
                                |
       +------------+-----------+-----------+-----------+
       |            |           |           |           |
       v            v           v           v           v
   Identity       AI      Notifications   Storage    Analytics
      RBAC       Engine
```

The system must demonstrate the full lifecycle:

```text
Student
  -> institution
  -> academics
  -> career readiness
  -> placement
  -> recruiter
  -> alumni
  -> credential issuance
  -> credential sharing
  -> instant verification
  -> safe campus interactions throughout
```

---

# 1. NON-NEGOTIABLE ASSUMPTIONS

## 1.1 MVP platform

Build **web only**.

Do not build Flutter/React Native during the hackathon.

The web must be responsive enough for:

- laptop;
- tablet;
- phone browser.

The backend must remain mobile-ready.

## 1.2 Institution reference

Use a fictional VIT Chennai-style dataset and campus structure.

Do not claim:

- official VIT Chennai integration;
- official data;
- official endorsement;
- official placement relationships;
- official university APIs.

Never use real personal data.

## 1.3 Hardware constraint

We have no hardware.

Therefore:

- CCTV integration is simulated;
- GPS is simulated;
- IoT events are simulated;
- biometric/face recognition is future only;
- real RTSP camera integration is future only.

The UI must label simulations clearly when needed.

## 1.4 Payment constraint

Actual payment gateway integration is not required for the MVP.

Fees are represented as:

- fee records;
- amount due;
- status;
- payment history demo data.

Real gateway integration is future.

## 1.5 Existing ERP integration

Assume there is no existing ERP API available during the hackathon.

The platform is self-contained.

Future integration uses adapter/API connectors.

## 1.6 Zero-cost hackathon constraint

Do not require paid infrastructure.

Prefer:

- free tiers;
- open-source libraries;
- local services;
- seeded/demo data;
- minimal external dependencies.

If an external AI API is used, the system must have a fallback path so one API failure does not kill the demo.

---

# 2. RUTHLESS SCOPE RULE

If a feature is not in this document, it is not a priority.

Do not add:

- random dashboards;
- unnecessary CRUD;
- speculative microservices;
- random AI chatbots;
- decorative blockchain;
- complex animations;
- unnecessary mobile code;
- hardware integration;
- advanced ML training.

Every feature must answer:

1. Which problem statement requirement does it address?
2. Which user role needs it?
3. Which end-to-end workflow does it improve?
4. Does it help the judging story?
5. Can it be implemented and tested safely within the hackathon?

If the answer is no, defer it.

---

# 3. FROZEN TECHNOLOGY STACK

## 3.1 Frontend

- React
- TypeScript
- Vite unless the existing repository already has another functioning React framework
- Tailwind CSS
- shadcn/ui or equivalent reusable component library
- React Router if routing is needed
- TanStack Query for server-state fetching/caching
- Zod for client-side validation
- Recharts for analytics

Do not add multiple UI libraries.

## 3.2 Backend

- Node.js
- TypeScript
- Fastify preferred
- Express acceptable only if repository already uses it and works
- Zod for request validation
- Prisma ORM
- PostgreSQL

## 3.3 AI

- Python
- FastAPI
- Pydantic
- Provider-agnostic LLM client wrapper

Do not hard-code the entire product to one model provider.

## 3.4 Credential security

- SHA-256 for credential hashing
- asymmetric digital signatures
- server-side key management
- canonical credential serialization
- QR verification URL

Private keys must never be committed to Git.

## 3.5 Blockchain

Use:

```text
Credential Service
      |
      v
BlockchainAdapter
      |
      +-- Hackathon implementation
      |
      +-- Future permissioned-chain adapter
```

Target future permissioned implementation:

- Hyperledger Fabric or equivalent permissioned network

The MVP must have a genuinely tamper-evident proof mechanism, but the whole application must not be hard-coupled to one blockchain vendor/network.

Do not call a normal PostgreSQL record "blockchain".

---

# 4. ARCHITECTURE STYLE

## 4.1 Modular monolith

Do NOT build microservices.

Use one backend application with clearly separated modules:

```text
apps/api
  /auth
  /users
  /institution
  /academics
  /attendance
  /fees
  /hostel
  /transport
  /communication
  /complaints
  /safety
  /career
  /placement
  /recruiter
  /alumni
  /credentials
  /verification
  /notifications
  /analytics
```

The AI service is separate because Python AI dependencies are a distinct concern.

## 4.2 Why modular monolith

- fewer deployment problems;
- easier local development;
- fewer network failures;
- fewer merge conflicts;
- simpler debugging;
- appropriate for three developers;
- easier to refactor into services later.

---

# 5. HIGH-LEVEL SYSTEM TOPOLOGY

```text
                         Browser
                            |
                       HTTPS / JSON
                            |
                    React Web Application
                            |
                            v
                 Node.js Modular Monolith
                            |
      +---------------------+---------------------+
      |                     |                     |
      v                     v                     v
  PostgreSQL           Python AI Service     Credential Service
      |                     |                     |
      |                     v                     v
      |                 LLM/Models         Blockchain Adapter
      |
      +-- Prisma
      |
      +-- Audit Logs
      +-- Seed Data

Optional object storage:
credential files / generated documents
```

---

# 6. SHARED CONTRACTS — FREEZE THESE FIRST

No feature coding begins until these are accepted.

## 6.1 User identity

Use one global:

```text
User.id
```

Every module references the same User ID.

Do not create:

- PlacementStudentID
- SafetyStudentID
- CredentialStudentID

as unrelated identities.

## 6.2 Student identity

The system has:

```text
User.id
StudentProfile.id
studentEnrollmentNumber
```

The enrollment number is business data.

The internal database primary key is the stable UUID/ID.

Use the internal ID for relationships.

## 6.3 Institutional identity

Each user belongs to an institution through an institution relationship.

For future multi-tenancy:

```text
Institution
  -> Campus
  -> Department
  -> Program
```

All important domain records should be traceable to an institution.

## 6.4 Role identity

A user can have multiple roles.

Example:

```text
User
  |
  +-- Student
  +-- Alumni
```

Do not create duplicate user records for students who later become alumni.

---

# 7. FROZEN ROLE CATALOG

## 7.1 Core roles

- STUDENT
- FACULTY
- PARENT
- HOD
- COLLEGE_ADMIN
- SECURITY_OFFICER
- WARDEN
- TRANSPORT_MANAGER
- TPO
- COUNSELLOR
- MAINTENANCE
- RECRUITER
- COMPANY_ADMIN
- ALUMNI
- INSTITUTION_ISSUER
- VERIFIER
- SUPER_ADMIN

## 7.2 Admin separation

Use:

- COLLEGE_ADMIN for institution operations
- SUPER_ADMIN for platform-level administration

Do not give SUPER_ADMIN casually.

---

# 8. PERMISSION MODEL

Use RBAC first.

Future ABAC is possible.

Example permissions:

```text
student.read.self
student.write.self

attendance.read.self
attendance.write.class

placement.drive.create
placement.application.create
placement.application.read.self
placement.candidate.shortlist

credential.issue
credential.verify
credential.revoke
credential.share.read

safety.incident.create
safety.incident.manage
```

Permissions should be centralized.

Do not scatter hard-coded role names throughout frontend and backend.

---

# 9. AUTHENTICATION

## P0

- email/password or institution ID/password;
- password hashing;
- login;
- logout;
- protected routes;
- role-aware session;
- password reset can be simplified for demo;
- token/session expiration.

## Recommended pattern

Use short-lived access token and refresh strategy, or secure server session if the existing framework favors it.

Do not expose sensitive tokens to arbitrary frontend storage if an HTTP-only cookie design is practical.

## Future

- institution SSO;
- Microsoft/Google SSO;
- MFA;
- passkeys.

---

# 10. DATABASE DESIGN PRINCIPLES

- PostgreSQL
- Prisma
- foreign keys
- unique constraints
- indexes on frequently queried IDs
- soft-delete/status approach where appropriate
- migrations
- seed script

Do not use JSON columns to avoid designing relationships unless there is a genuine document-like field.

---

# 11. DATABASE MASTER ENTITY MAP

```text
Institution
 |
 +-- Campus
 +-- Department
 +-- Program
 +-- AcademicYear
 |
 +-- Users
       |
       +-- StudentProfile
       +-- FacultyProfile
       +-- ParentProfile
       +-- AlumniProfile
       +-- RecruiterProfile
```

Academics:

```text
Program
  |
Course
  |
CourseEnrollment
  |
Attendance

Course
  |
Assessment/Exam
  |
ExamResult
```

Placement:

```text
Company
  |
Recruiter
  |
PlacementDrive
  |
Job
  |
JobApplication
  |
Shortlist
  |
Interview
  |
SelectionResult
```

Credentials:

```text
Student
  |
Credential
  |
CredentialHash
  |
DigitalSignature
  |
LedgerRecord
  |
CredentialShare
  |
VerificationRequest
```

Safety:

```text
Student
  |
SOSAlert
  |
Incident
  |
SecurityAlert
  |
ResponseAction
```

---

# 12.1 Recommended core tables

## Identity

- User
- Role
- Permission
- UserRole
- RefreshToken/Session
- AuditLog

## Institution

- Institution
- Campus
- Department
- Program
- AcademicYear
- Semester

## People

- StudentProfile
- FacultyProfile
- ParentProfile
- StudentParent
- AlumniProfile
- RecruiterProfile

## Academics

- Course
- CourseEnrollment
- FacultyCourse
- AttendanceSession
- AttendanceRecord
- Exam
- ExamResult
- Assignment
- TimetableEntry

## Administration

- FeeRecord
- PaymentRecord
- LeaveRequest
- Notice
- Complaint
- MaintenanceRequest

## Hostel

- Hostel
- Room
- RoomAllocation
- HostelLeave
- HostelVisitor

## Transport

- Vehicle
- Driver
- Route
- TransportAssignment
- SimulatedLocationEvent

## Placement/Career

- Skill
- StudentSkill
- CareerGoal
- CareerAssessment
- AssessmentResult
- CareerRecommendation
- LearningResource
- Resume
- ResumeAnalysis
- MockInterview
- MockInterviewSession
- Company
- PlacementDrive
- Job
- EligibilityRule
- JobApplication
- Shortlist
- Interview
- SelectionResult

## Alumni

- MentorshipRequest
- MentorshipSession
- AlumniOpportunity
- Referral
- AlumniEvent

## Safety

- Incident
- IncidentType
- SOSAlert
- SafetyEvent
- SecurityResponse
- Visitor

## Credentials

- CredentialType
- Credential
- CredentialDocument
- CredentialHash
- DigitalSignature
- CredentialShare
- VerificationRequest
- RevocationRecord
- LedgerRecord

## Shared

- Notification
- FileAsset
- SystemSetting

---

# 13. API CONVENTION — FREEZE

Base:

```text
/api/v1
```

Response envelope:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

## API rules

- plural nouns;
- REST;
- predictable IDs;
- pagination for lists;
- validation on every request;
- backend authorization;
- consistent error codes.

Example:

```text
GET    /api/v1/students/me
GET    /api/v1/students/:id
GET    /api/v1/attendance/me
POST   /api/v1/attendance/sessions
POST   /api/v1/attendance/sessions/:id/records
GET    /api/v1/placements/drives
POST   /api/v1/placements/drives
POST   /api/v1/placements/drives/:id/apply
GET    /api/v1/credentials
POST   /api/v1/credentials
GET    /api/v1/credentials/:id
GET    /api/v1/verification/:credentialId
POST   /api/v1/credentials/:id/revoke
```

---

# 14. API DOCUMENTATION

Maintain:

```text
docs/api/
```

For each endpoint document:

- method;
- URL;
- role;
- permission;
- input;
- output;
- validation;
- failure cases;
- example.

OpenAPI/Swagger is desirable if already easy to integrate.

---

# 15. FRONTEND ROUTING

```text
/login

/student/dashboard
/student/profile
/student/academics
/student/attendance
/student/timetable
/student/results
/student/fees
/student/complaints
/student/hostel
/student/transport
/student/safety
/student/career
/student/placement
/student/credentials
/student/notifications

/faculty/dashboard
/faculty/classes
/faculty/attendance
/faculty/marks
/faculty/assignments
/faculty/students

/parent/dashboard
/parent/student
/parent/attendance
/parent/results
/parent/fees
/parent/transport
/parent/alerts

/hod/dashboard

/admin/dashboard

/security/dashboard
/security/incidents
/security/alerts

/warden/dashboard

/transport/dashboard

/counsellor/dashboard

/maintenance/dashboard

/tpo/dashboard
/tpo/drives
/tpo/students
/tpo/companies
/tpo/analytics

/recruiter/dashboard
/recruiter/company
/recruiter/jobs
/recruiter/candidates
/recruiter/interviews

/alumni/dashboard
/alumni/profile
/alumni/mentorship
/alumni/opportunities
/alumni/events

/institution/dashboard
/institution/credentials
/institution/issuance
/institution/revocation

/verifier/dashboard
/verifier/scan
/verifier/history

/super-admin/dashboard
```

Routes should be grouped by role.

---

# 16. SHARED FRONTEND COMPONENT CONTRACT

Build once:

- AppShell
- Sidebar
- Topbar
- PageHeader
- StatCard
- DataTable
- SearchFilter
- StatusBadge
- Modal
- ConfirmDialog
- FormField
- EmptyState
- LoadingState
- ErrorState
- NotificationBell
- RoleGuard
- PermissionGuard
- QRCode
- VerificationStatus
- ChartCard
- Timeline
- FileUpload
- Pagination

No teammate should duplicate these.

---

# 17. TEAM OWNERSHIP — FROZEN

## TEAMMATE 1
**Core Platform + ERP + DevOps**

Owns:

- repository foundation;
- authentication;
- RBAC;
- users;
- institution;
- core student;
- faculty;
- parent;
- HOD;
- academics;
- attendance;
- exams/results;
- timetable;
- fees;
- complaints;
- hostel;
- transport;
- notification foundation;
- database foundation;
- deployment;
- integration ownership.

## TEAMMATE 2
**Career + Placement + Alumni**

Owns:

- career profile;
- skills;
- career assessment UI/business logic;
- skill gap display;
- roadmap;
- resume;
- placements;
- TPO;
- recruiter;
- company validation;
- applications;
- shortlisting;
- interviews;
- alumni;
- mentorship;
- referrals;
- career analytics.

## TEAMMATE 3
**AI + Safety + Credentials**

Owns:

- FastAPI service;
- AI orchestration;
- AI mock interview;
- AI resume analysis;
- AI career explanation;
- safety event simulation;
- incident engine;
- security dashboard;
- SOS integration;
- credential service;
- digital signatures;
- QR verification;
- blockchain adapter.

---

# 18. SHARED-FILE OWNERSHIP

These are high-conflict files/directories:

- Prisma schema
- root package.json
- lockfile
- root config
- shared types
- shared UI library
- router registration
- environment example
- deployment config

## Rule

Only the designated owner modifies them unless coordinated.

### Owner map

```text
Prisma schema: Team 1 primary owner
Auth/RBAC: Team 1
Shared UI: Team 1 foundation, others request additions
Shared types: contract reviewed by Team 1
AI service contracts: Team 3
Placement domain: Team 2
Credential domain: Team 3
Safety domain: Team 3
Deployment: Team 1
```

---

# 19. REPOSITORY STRUCTURE

Respect the existing skeleton. The target logical structure is:

```text
campus-os/
├── apps/
│   ├── web/
│   ├── api/
│   └── ai-service/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   └── config/
│
├── services/
│   ├── credentials/
│   └── blockchain/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── modules/
│   ├── workflows/
│   └── decisions/
│
├── scripts/
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 20. MODULE DEVELOPMENT SPECIFICATION

The following modules are the frozen implementation boundaries.

---

# MODULE A — AUTHENTICATION & RBAC

**Owner:** Team 1  
**Priority:** P0

## Purpose

Provide one identity system for all roles.

## Features

- registration;
- login;
- logout;
- protected routes;
- role selection;
- permission enforcement;
- session/token management;
- current-user endpoint.

## Workflow

```text
User
 -> login
 -> credentials verified
 -> user loaded
 -> roles loaded
 -> session created
 -> frontend receives user + permissions
 -> route guard
 -> backend permission check
```

## APIs

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

## Acceptance criteria

- wrong password rejected;
- unauthorized route rejected;
- user sees only authorized UI;
- backend also rejects unauthorized actions;
- same user can have Student + Alumni role.

---

# MODULE B — USER & INSTITUTION

**Owner:** Team 1  
**Priority:** P0

## Features

- institution;
- departments;
- programs;
- users;
- profiles;
- role assignment;
- status;
- demo seed.

## APIs

```text
GET /api/v1/institutions/me
GET /api/v1/departments
GET /api/v1/users/:id
GET /api/v1/students/:id
```

---

# MODULE C — STUDENT PROFILE

**Owner:** Team 1  
**Priority:** P0

## Fields

- name;
- enrollment number;
- email;
- phone where appropriate;
- program;
- department;
- year;
- semester;
- CGPA;
- skills;
- certifications;
- projects;
- internships;
- profile photo placeholder;
- career goal.

## Integrations

Career module consumes this data.

Placement module consumes this data.

Credential module maps credential to student.

---

# MODULE D — ACADEMICS

**Owner:** Team 1  
**Priority:** P0

## Features

- courses;
- enrollments;
- faculty assignments;
- timetable;
- exam schedule;
- results;
- assignments basic.

## Workflow

```text
Admin/HOD
 -> course
 -> faculty assignment
 -> student enrollment
 -> timetable
 -> attendance/results
```

---

# MODULE E — ATTENDANCE

**Owner:** Team 1  
**Priority:** P0

## Method

Faculty manual attendance.

## Workflow

```text
Faculty
 -> select course
 -> select session
 -> student roster
 -> mark present/absent
 -> save
 -> student view
 -> parent view
 -> analytics
```

## Business rules

- only assigned faculty may mark attendance;
- only existing enrolled students appear;
- one attendance record per student per session;
- edits should be auditable.

## Future

QR/RFID/NFC/biometric/face recognition.

---

# MODULE F — FEES

**Owner:** Team 1  
**Priority:** P1

## Features

- current dues;
- fee history;
- demo payment history;
- receipts metadata.

No real payment gateway in MVP.

---

# MODULE G — COMPLAINTS & MAINTENANCE

**Owner:** Team 1  
**Maintenance UI:** Team 1

## Workflow

```text
Student/Faculty
 -> complaint
 -> category
 -> priority
 -> assigned staff
 -> in progress
 -> resolved
 -> closed
```

## Status

```text
OPEN
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
```

---

# MODULE H — HOSTEL

**Owner:** Team 1  
**Priority:** P1

## Features

- buildings;
- rooms;
- allocations;
- warden;
- leave;
- visitor record;
- complaint.

---

# MODULE I — TRANSPORT

**Owner:** Team 1  
**Priority:** P1

## Features

- buses;
- drivers;
- routes;
- assigned students;
- simulated location;
- student view;
- parent view.

## Important

All location data is demo/simulated.

---

# MODULE J — NOTIFICATIONS

**Owner:** Team 1  
**Priority:** P0

## P0

In-app notifications.

Events:

- placement published;
- shortlist;
- interview;
- safety;
- credential issued;
- credential revoked;
- mentorship request;
- complaint update.

---

# MODULE K — CAREER PROFILE

**Owner:** Team 2  
**Priority:** P0

## Features

- target role;
- skills;
- interests;
- experience;
- projects;
- certification;
- career readiness summary.

Consumes core student profile from Team 1.

---

# MODULE L — CAREER ASSESSMENT

**Owner:** Team 2 UI/business orchestration, Team 3 AI logic  
**Priority:** P0

## Assessment types

- aptitude;
- coding score input or lightweight coding score;
- technical;
- communication;
- career interest.

## Flow

```text
Student
 -> assessment
 -> score normalization
 -> AI/service analysis
 -> strengths
 -> gaps
 -> recommendations
```

## Important

Hard scoring and known rules are deterministic.

AI explains and personalizes.

---

# MODULE M — SKILL GAP & CAREER ROADMAP

**Owner:** Team 2 + Team 3  
**Priority:** P0

## Inputs

- student skills;
- target role;
- assessment;
- jobs;
- skill catalog.

## Output

- missing skills;
- priority;
- learning sequence;
- suggested resources;
- project suggestions.

## Example

```text
Target: AI Engineer

Gap:
Deep Learning - HIGH
System Design - MEDIUM
Communication - MEDIUM
```

---

# MODULE N — RESUME

**Owner:** Team 2  
**AI analysis:** Team 3  
**Priority:** P0

## Features

- structured resume;
- resume versions;
- AI summary;
- project bullet suggestions;
- ATS-style keyword check;
- job-specific improvement.

## Important disclaimer

Call it an "ATS-style analysis", not a guarantee of compatibility with every ATS.

---

# MODULE O — AI MOCK INTERVIEW

**Owner:** Team 3  
**Priority:** P0/P1 depending on timing

## MVP

Text-based interview.

## Flow

```text
Student
 -> role selection
 -> AI question
 -> answer
 -> evaluation
 -> score
 -> feedback
 -> next question
```

## Evaluation

- relevance;
- completeness;
- technical quality;
- clarity;
- communication.

Voice/video analysis is future.

---

# MODULE P — PLACEMENT DRIVE

**Owner:** Team 2  
**Priority:** P0

## TPO features

- create drive;
- job;
- package;
- location;
- job description;
- eligibility;
- skills;
- deadline;
- selection steps;
- publish;
- close.

---

# MODULE Q — ELIGIBILITY ENGINE

**Owner:** Team 2  
**Priority:** P0

## Rules

- CGPA;
- branch;
- semester/year;
- backlogs;
- required skills;
- optional certification.

## Key rule

Eligibility must be deterministic.

Do not let an LLM decide whether a student meets hard eligibility criteria.

---

# MODULE R — STUDENT APPLICATION

**Owner:** Team 2  
**Priority:** P0

## Workflow

```text
Student
 -> open drive
 -> eligibility displayed
 -> apply
 -> select resume
 -> submit
 -> application status
```

Statuses:

```text
APPLIED
UNDER_REVIEW
SHORTLISTED
ASSESSMENT
INTERVIEW
SELECTED
REJECTED
WAITLISTED
WITHDRAWN
```

---

# MODULE S — RECRUITER / COMPANY

**Owner:** Team 2  
**Priority:** P0

## Registration

Anyone can register.

## Trust workflow

```text
REGISTERED
  |
PENDING_VERIFICATION
  |
VALIDATING
  |
VERIFIED
  |
ACTIVE
```

## Validation

- company name;
- domain;
- website;
- recruiter identity;
- contact information;
- manual TPO/admin approval.

Do not claim legal or government verification.

---

# MODULE T — RECRUITER CANDIDATES

**Owner:** Team 2  
**Priority:** P0

Recruiter can see only approved recruitment data.

Possible fields:

- name;
- program;
- branch;
- CGPA;
- skills;
- selected assessment scores;
- resume;
- application status.

Not allowed:

- fees;
- counselling;
- private parent information;
- hostel complaints.

---

# MODULE U — SHORTLIST / INTERVIEW / SELECTION

**Owner:** Team 2  
**Priority:** P0

## Workflow

```text
Applications
 -> recruiter review
 -> shortlist
 -> assessment
 -> interview
 -> result
 -> selection
 -> student + TPO notification
```

---

# MODULE V — ALUMNI

**Owner:** Team 2  
**Priority:** P0

## Features

- alumni profile;
- expertise;
- company;
- role;
- mentorship;
- mock interviews;
- resume review;
- opportunities;
- referrals;
- industry insights;
- events.

## Mentorship workflow

```text
Student
 -> request mentor
 -> Alumni accepts
 -> session scheduled
 -> feedback
 -> completed
```

## Important

Alumni do not receive general private student records.

---

# MODULE W — CAMPUS SAFETY

**Owner:** Team 3  
**Priority:** P0

## Safety features

- SOS;
- incident reporting;
- incident classification;
- security dashboard;
- alerts;
- response;
- simulated AI safety events;
- visitor records.

---

# MODULE X — SOS

**Owner:** Team 3

## Student flow

```text
Press SOS
 -> location/demo zone
 -> emergency type
 -> severity
 -> create alert
 -> security dashboard
 -> response assigned
 -> resolved
```

## P0

Use simulated campus location if needed.

---

# MODULE Y — INCIDENT MANAGEMENT

**Owner:** Team 3

## Fields

- reporter;
- type;
- severity;
- location;
- description;
- timestamp;
- status;
- assigned security person;
- response notes.

## Status

```text
OPEN
ACKNOWLEDGED
RESPONDING
RESOLVED
CLOSED
```

---

# MODULE Z — SIMULATED AI SAFETY EVENTS

**Owner:** Team 3

## Example events

- unauthorized entry;
- restricted zone;
- crowd detected;
- smoke/fire demo;
- suspicious event.

## Flow

```text
Simulated Event
 -> event classifier
 -> severity
 -> alert
 -> security dashboard
```

## Disclaimer

These are simulations because no real camera/IoT hardware is available.

---

# MODULE AA — CREDENTIAL ISSUANCE

**Owner:** Team 3  
**Priority:** P0

## Credential types

- Transcript
- Degree Certificate
- Migration Certificate

## Issuance flow

```text
Institution
 -> select student
 -> select credential type
 -> generate credential data
 -> canonicalize
 -> hash
 -> sign
 -> ledger/blockchain proof
 -> store metadata
 -> student wallet
```

---

# MODULE AB — CREDENTIAL DOCUMENT

**Owner:** Team 3

The actual sensitive document/data should be kept off-chain.

Possible storage:

- encrypted document;
- structured credential JSON;
- secure object storage.

The ledger stores proof, not the full sensitive document.

---

# MODULE AC — CRYPTOGRAPHIC SIGNATURE

**Owner:** Team 3

## Flow

```text
Canonical Credential JSON
 -> SHA-256
 -> sign with institution private key
 -> store signature
```

Verification:

```text
Credential data
 -> canonicalize
 -> SHA-256
 -> verify signature against issuer public key
```

---

# MODULE AD — BLOCKCHAIN / LEDGER ADAPTER

**Owner:** Team 3

Interface:

```text
recordCredentialProof(hash, metadata)
verifyCredentialProof(hash, recordId)
getCredentialProof(recordId)
```

The application does not directly depend on blockchain-specific code.

## Minimum proof fields

- record ID;
- credential hash;
- issuer ID;
- timestamp;
- network/ledger reference;
- transaction/record reference.

## Hard requirement

Do not fake a transaction hash.

If the ledger is simulated, label it as simulated/tamper-evident ledger in the UI.

If an actual permissioned chain is successfully deployed, expose the real transaction/record reference.

---

# MODULE AE — QR VERIFICATION

**Owner:** Team 3

QR contains:

```text
verification URL
+
credential identifier
+
non-secret verification reference
```

Do not put sensitive transcript data directly inside the QR.

---

# MODULE AF — VERIFIER

**Owner:** Team 3

Verifier types:

- employer;
- university;
- embassy/government authority conceptually.

## Verification page

Show:

- credential type;
- issuer;
- issue date;
- student identity as permitted;
- signature result;
- hash result;
- ledger proof;
- revocation status.

Statuses:

```text
AUTHENTIC
MODIFIED
REVOKED
NOT_FOUND
INVALID_SIGNATURE
```

---

# MODULE AG — CREDENTIAL SHARING

**Owner:** Team 3

## Flow

```text
Student
 -> select credential
 -> choose recipient
 -> create share
 -> optional expiry
 -> verifier accesses
```

Future selective disclosure is out of scope.

---

# MODULE AH — REVOCATION

**Owner:** Team 3

Institution can:

- revoke;
- reason;
- timestamp;
- preserve history.

Student cannot overwrite issuer status.

---

# 18. CROSS-MODULE CONTRACTS

## 18.1 Student -> Placement

Placement receives:

- student ID;
- program;
- department;
- CGPA;
- skills;
- resume references.

## 18.2 Student -> Career AI

AI receives:

- normalized profile;
- skills;
- assessment;
- target role.

## 18.3 Student -> Credentials

Credential receives:

- student ID;
- verified academic records;
- institution.

## 18.4 Student -> Safety

Safety receives:

- student ID;
- incident;
- location/demo zone.

## 18.5 Alumni -> Placement

Alumni may create:

- opportunities;
- referrals;
- mentor events.

TPO can moderate.

---

# 19. MODULE COMMUNICATION RULE

Modules communicate through service interfaces or APIs.

Do not:

```text
Placement module
 -> directly modify Credential module database tables
```

Do:

```text
Placement module
 -> Credential API/service contract
```

This prevents hidden coupling.

---

# 20. AI SERVICE CONTRACT

Node backend calls:

```text
POST /ai/career/assessment
POST /ai/career/roadmap
POST /ai/resume/analyze
POST /ai/interview/start
POST /ai/interview/evaluate
POST /ai/explain/recommendation
```

AI service must return structured JSON.

Example:

```json
{
  "score": 72,
  "strengths": ["Python", "SQL"],
  "gaps": [
    {
      "skill": "Deep Learning",
      "priority": "HIGH"
    }
  ],
  "recommendations": [
    {
      "type": "LEARNING",
      "title": "Deep Learning Fundamentals"
    }
  ]
}
```

Do not return uncontrolled paragraphs when structured data is needed.

---

# 21. AI SAFETY RULES

AI must not:

- invent academic grades;
- invent credential verification;
- change placement eligibility;
- expose private student information;
- make medical/legal claims;
- automatically make disciplinary decisions.

The application determines authorization and hard business rules.

AI produces recommendations/explanations.

---

# 22. SECURITY ARCHITECTURE

## Authentication

- secure password hashing;
- protected routes;
- expiration;
- session handling.

## Authorization

Backend permission checks.

## Validation

Zod/Pydantic.

## Secrets

`.env`, secret manager in future.

## Logging

No password/token logging.

## Audit

High-risk actions audited.

---

# 23. AUDIT EVENTS

P0 audit events:

- login;
- role change;
- credential issued;
- credential revoked;
- credential verified;
- recruiter verified;
- placement selection;
- safety incident status changes;
- administrative modification of critical records.

---

# 24. PRIVACY RULES

## Student data

Minimum access.

## Recruiters

Placement data only.

## Parents

Only linked child information.

## Alumni

Only explicit/publicly shareable or mentorship-related information.

## Counsellor

Restricted support data.

## Institution

Academic credential authority.

## Verifier

Only shared credential information.

---

# 25. FILE & STORAGE POLICY

Never store secrets or sensitive records in Git.

For document files:

- keep private;
- access through backend;
- use non-guessable identifiers;
- use expiring URLs where possible.

---

# 26. ERROR HANDLING

All API endpoints:

- validate input;
- catch predictable errors;
- return standard error object;
- never return internal stack traces to clients.

Frontend:

- loading state;
- empty state;
- error state;
- retry path.

---

# 27. SEED DATA SPECIFICATION

The seed script is mandatory.

## Institution

Fictional:

```text
VIT-Style Institute, Chennai Campus
```

Departments:

- CSE
- ECE
- EEE
- Mechanical
- Civil
- AI & DS

Programs:

- B.Tech
- M.Tech conceptually if needed

## Students

At least 15–30.

## Faculty

5–10.

## Parents

linked to demo students.

## TPO

1–2.

## Recruiters

3–5 fictional companies.

## Alumni

8–15.

## Safety

- active SOS;
- resolved incident;
- simulated CCTV alert.

## Credentials

At least:

- 2 transcripts;
- 1 degree;
- 1 migration certificate.

---

# 28. DEMO USERS

Use obvious demo accounts.

```text
student@demo.local
faculty@demo.local
parent@demo.local
tpo@demo.local
recruiter@demo.local
alumni@demo.local
security@demo.local
warden@demo.local
transport@demo.local
counsellor@demo.local
admin@demo.local
institution@demo.local
verifier@demo.local
```

Do not use actual personal email accounts.

---

# 29. DEMO STORY

The strongest demo follows one student.

Example:

```text
Ananya Sharma
B.Tech CSE
CGPA 8.6
Target: AI Engineer
```

## Step 1

Login student.

Show:

- attendance;
- academic overview;
- career readiness.

## Step 2

AI assessment.

Show:

- strengths;
- gaps;
- roadmap.

## Step 3

Show job recommendation.

## Step 4

Apply.

## Step 5

TPO sees application.

## Step 6

Recruiter shortlists.

## Step 7

Student gets notification.

## Step 8

Alumni mentorship.

## Step 9

Institution issues transcript.

## Step 10

Student shares credential.

## Step 11

Verifier scans QR.

## Step 12

Verification proves:

```text
Signature valid
Hash matches
Ledger proof valid
Not revoked
```

## Step 13

Trigger safety incident.

Security responds.

This is the complete "student lifecycle" narrative.

---

# 30. JUDGE-VISIBLE DIFFERENTIATORS

Focus visual polish on:

1. Unified student dashboard.
2. AI skill-gap visualization.
3. Placement pipeline.
4. Alumni mentoring.
5. Safety alert.
6. Credential wallet.
7. QR verification.
8. Tamper detection.
9. Cross-role workflow.

---

# 31. DEMO FAILURE PLAN

## AI failure

Fallback:

- cached deterministic sample output;
- mock response from demo data.

Must be visually identical to normal output where possible.

## Blockchain failure

Use previously issued credential proof for demo.

Do not fabricate blockchain transaction data.

## Database failure

- seed script;
- backup;
- restartable environment.

## Network problem

Have local demo instructions prepared.

---

# 32. DEPLOYMENT

The MVP must be deployed.

Logical architecture:

```text
Frontend Host
      |
      v
Web App
      |
      v
Backend Host
  |         |
  v         v
Postgres   AI Service
      |
      v
Credential Service
      |
      v
Ledger / Blockchain Adapter
```

The actual hosting provider is not architecturally important.

Choose a free/low-cost provider that works during the hackathon.

Do not optimize prematurely for enterprise cloud.

---

# 33. ENVIRONMENT

Required:

```text
NODE_ENV=
DATABASE_URL=
AUTH_SECRET=
AI_PROVIDER=
AI_API_KEY=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
CREDENTIAL_PRIVATE_KEY=
BLOCKCHAIN_CONFIG=
```

Only required variables should be included.

`.env.example` contains blank/placeholder values.

---

# 34. DOCKER

Use Docker where it simplifies:

- PostgreSQL;
- AI service;
- local credential dependencies;
- optional object storage.

Do not force Docker onto every part of the system unnecessarily.

---

# 35. LOCAL SETUP CONTRACT

Target experience:

```bash
git clone <repo>
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

AI service should have its own documented setup if Python environment is separate.

---

# 36. GIT STRATEGY

Branches:

```text
main
develop

feature/core-platform
feature/career-placement
feature/ai-safety-credentials
```

Each teammate creates subbranches from their ownership branch when needed.

Example:

```text
feature/career-placement/eligibility
feature/career-placement/recruiter
```

---

# 37. GIT RULES

- Pull/rebase before PR.
- Small commits.
- One concern per commit where practical.
- Never commit secrets.
- Never force-push shared branches unless explicitly coordinated.
- Never make giant end-of-day merges.

Commit examples:

```text
feat(auth): add role-aware session
feat(placement): add eligibility engine
feat(credentials): add credential signing
feat(safety): add SOS incident flow
fix(recruiter): restrict candidate fields
```

---

# 38. MERGE-CONFLICT PREVENTION

## Shared files

Changes must be coordinated.

## Domain ownership

Do not edit another teammate's module casually.

## Shared types

Add only required types.

## Prisma

One schema owner, controlled updates.

## Router

Register modules through predictable import structure rather than all editing one giant file.

## UI

Use shared components.

---

# 39. DAILY INTEGRATION

Every day:

1. Pull latest develop.
2. Rebase/merge into local work.
3. Run tests/build.
4. Push small changes.
5. Open PR.
6. Review.
7. Merge.
8. Verify shared develop.

Never leave all integration to the final day.

---

# 40. DEFINITION OF DONE

A feature is DONE when:

- implemented;
- API works;
- UI works;
- role permissions work;
- seeded/demo data works;
- validation works;
- error state exists;
- tested;
- no obvious console error;
- documented;
- merged;
- works from clean checkout.

---

# 41. TESTING STRATEGY

## Unit

Test:

- eligibility;
- permission checks;
- credential hash;
- signature validation;
- revocation logic.

## Integration

Test:

- login;
- attendance;
- placement application;
- recruiter shortlist;
- credential issuance;
- credential verification;
- safety incident.

## Manual E2E

Run the judge flow.

---

# 42. CRITICAL TEST MATRIX

## Student

- cannot view another student's private information;
- can view own data;
- can apply only when eligible;
- can share credentials.

## Faculty

- can mark assigned classes only.

## Parent

- sees linked student only.

## TPO

- can create drives;
- cannot issue academic credentials.

## Recruiter

- can view recruitment fields only.

## Alumni

- can mentor;
- cannot modify academic records.

## Institution

- can issue/revoke credentials.

## Verifier

- can verify credential;
- cannot edit credential.

## Admin

- system management;
- no silent rewriting of issued academic credentials.

---

# 43. PERFORMANCE TARGETS

Do not claim performance numbers without measurement.

For MVP:

- fast first dashboard load on demo seed;
- paginated lists;
- avoid huge database queries;
- use indexes for common filters;
- cache read-heavy AI/recommendation results when useful.

---

# 44. OBSERVABILITY

P0:

- server logs;
- frontend errors;
- deployment logs.

Future:

- metrics;
- tracing;
- centralized observability;
- alerts.

---

# 45. BACKUP

Before final demo:

- database dump;
- source code pushed;
- `.env` secrets stored safely;
- seed script verified;
- deployed version working;
- backup restore tested once.

---

# 46. P0 FEATURE FREEZE

P0 means required.

## Platform

- auth;
- RBAC;
- seed;
- student profile;
- notifications;
- deployment.

## ERP

- student;
- faculty;
- parent;
- HOD;
- admin;
- attendance;
- timetable;
- results;
- fees summary;
- complaints;
- safety/SOS;
- basic hostel;
- basic transport.

## Career

- profile;
- assessment;
- skill gaps;
- roadmap;
- resume;
- placement drive;
- recruiter;
- TPO;
- application;
- shortlist;
- selection;
- alumni.

## Safety

- incident;
- SOS;
- security dashboard;
- simulated AI event.

## Credentials

- transcript;
- degree;
- migration;
- issue;
- sign;
- hash;
- ledger/blockchain proof;
- QR;
- verify;
- revoke.

---

# 47. P1

Only after P0:

- richer analytics;
- richer AI mock interviews;
- chatbot;
- email;
- advanced recruiter filters;
- richer hostel;
- richer transport simulation;
- more alumni events;
- more certificate types;
- advanced dashboards.

---

# 48. FUTURE

- Android;
- iOS;
- real CCTV;
- RTSP;
- IoT;
- real GPS;
- QR/RFID attendance;
- face recognition;
- biometrics;
- payments;
- full accounting;
- mess management;
- enterprise SSO;
- existing ERP integration;
- DID;
- advanced verifiable credentials;
- selective disclosure;
- enterprise permissioned blockchain network;
- multi-institution SaaS;
- advanced wellbeing analytics.

---

# 49. BUILD ORDER — FROZEN

## Stage 0 — FOUNDATION

**Do this first.**

Team 1 leads.

Freeze:

- repo;
- package manager;
- TypeScript;
- environment;
- PostgreSQL;
- Prisma;
- base schema;
- auth;
- RBAC;
- shared types;
- shared UI shell;
- API conventions;
- error format.

No feature branch should create conflicting architecture before Stage 0 is accepted.

---

## Stage 1 — CORE ERP + DATA

Team 1:

- institution;
- users;
- student;
- faculty;
- parent;
- academics;
- attendance;
- timetable;
- basic fees;
- complaints.

Team 2:

- career profile;
- skill catalog;
- placement domain skeleton.

Team 3:

- AI service skeleton;
- credential domain skeleton;
- safety domain skeleton.

Goal:

All services boot and communicate.

---

## Stage 2 — PLACEMENT FLOW

Team 2:

- company;
- recruiter;
- drive;
- eligibility;
- application;
- shortlist;
- interview;
- selection.

Integration:

- student data from Team 1;
- notifications from Team 1.

---

## Stage 3 — AI

Team 3:

- assessment analysis;
- skill gap;
- roadmap;
- resume analysis;
- mock interview.

Integration:

- Career UI from Team 2;
- Student profile from Team 1.

---

## Stage 4 — SAFETY

Team 3:

- SOS;
- incident;
- simulated camera event;
- security dashboard.

---

## Stage 5 — CREDENTIALS

Team 3:

- issuance;
- canonicalization;
- hash;
- signature;
- ledger/blockchain;
- QR;
- verification;
- revocation;
- sharing.

---

## Stage 6 — ALUMNI

Team 2:

- profile;
- mentorship;
- mock interviews;
- opportunities;
- referrals.

---

## Stage 7 — INTEGRATION

All teams:

- shared notifications;
- cross-dashboard visibility;
- consistent student identity;
- end-to-end flows.

---

## Stage 8 — POLISH

All teams:

- loading;
- errors;
- empty states;
- charts;
- responsiveness;
- demo data;
- performance;
- visual consistency.

---

## Stage 9 — DEPLOYMENT FREEZE

No major features after this point.

Only:

- bug fixes;
- deployment fixes;
- critical UX fixes;
- demo safety.

---

# 50. AI CODING ASSISTANT OPERATING RULE

Every AI assistant gets:

1. this document;
2. relevant module README;
3. current code;
4. exact task;
5. allowed files;
6. forbidden files;
7. acceptance criteria.

Never request:

> "Build the whole placement system."

Request:

> "Implement the placement drive creation API according to DEVELOPER_SPEC.md. Only modify placement module files and shared API types if necessary. Do not modify auth, Prisma entities outside placement, or UI shell."

---

# 51. AI TASK TEMPLATE

```text
PROJECT:
Unified Campus OS

SOURCE OF TRUTH:
DEVELOPER_SPEC.md

MODULE:
[MODULE]

OWNER:
[TEAMMATE]

TASK:
[EXACT TASK]

ALLOWED CHANGES:
[FILES/DIRECTORIES]

DO NOT CHANGE:
[FILES/DIRECTORIES]

API CONTRACT:
[ENDPOINTS]

DATA:
[ENTITIES]

ROLES:
[ROLES]

ACCEPTANCE CRITERIA:
[CRITERIA]

TEST:
[TEST REQUIREMENTS]

RULES:
- Do not invent new architecture.
- Do not rewrite unrelated code.
- Do not change shared auth.
- Do not change another team's module.
- Do not add dependencies without explaining why.
- Do not add secrets.
- Do not fake external integrations.
- Follow existing code style.
```

---

# 52. CHANGE CONTROL

If a teammate believes the architecture must change:

1. Create `docs/decisions/ADR-XXX.md`.
2. State problem.
3. State proposed change.
4. State impact.
5. State merge risk.
6. Team approves.
7. Only then implement.

No silent architectural changes.

---

# 53. END-TO-END WORKFLOW SPECIFICATIONS

## WORKFLOW 1 — Attendance

```text
Faculty login
 -> open class
 -> mark attendance
 -> save
 -> backend validates faculty assignment
 -> attendance stored
 -> student percentage updated
 -> parent view updated
 -> notification if threshold logic is configured
```

---

## WORKFLOW 2 — Placement

```text
TPO
 -> create drive
 -> set eligibility
 -> publish
 -> eligible students see drive
 -> student applies
 -> recruiter sees approved candidates
 -> recruiter shortlists
 -> student sees shortlist
 -> interview
 -> result
 -> selection
 -> TPO analytics
```

---

## WORKFLOW 3 — Alumni Mentoring

```text
Student
 -> browse alumni expertise
 -> request mentorship
 -> alumni accepts
 -> session scheduled
 -> feedback
 -> completed
```

---

## WORKFLOW 4 — Safety

```text
Student
 -> SOS
 -> incident created
 -> security alerted
 -> security acknowledges
 -> response
 -> resolution
 -> audit trail
```

---

## WORKFLOW 5 — Credential

```text
Institution
 -> verify academic data
 -> generate credential
 -> canonicalize
 -> hash
 -> sign
 -> ledger/blockchain proof
 -> store
 -> student receives
 -> student shares
 -> verifier scans
 -> proof checked
 -> signature checked
 -> status checked
 -> result displayed
```

---

# 54. CROSS-SYSTEM WORKFLOW — PRIMARY DEMO

```text
ERP Student Profile
       |
       +--> Career Readiness
       |
       +--> Placement
       |       |
       |       +--> Recruiter
       |       |
       |       +--> Alumni
       |
       +--> Credential
       |       |
       |       +--> Institution
       |       |
       |       +--> Verifier
       |
       +--> Safety
```

---

# 55. PRODUCT TRUTH MODEL

For every piece of data, define its source of truth.

| Data | Source of truth |
|---|---|
| User identity | Auth/User module |
| Student profile | Student module |
| Course | Academics |
| Attendance | Attendance |
| Placement drive | Placement |
| Recruitment result | Recruiter/TPO placement |
| AI recommendation | AI + stored recommendation |
| Credential issuance | Institution credential module |
| Credential status | Credential issuer/status |
| Blockchain proof | Ledger/blockchain layer |
| Safety incident | Safety |
| Notification | Notification module |

Do not duplicate authoritative data across modules unnecessarily.

---

# 56. SECURITY-SENSITIVE DATA RULE

Never expose:

- private keys;
- passwords;
- tokens;
- confidential counselling notes;
- unshared credentials;
- private parent records.

Do not log them.

---

# 57. CREDENTIAL TRUST MODEL

The institution is the authoritative issuer.

Student owns/controls access to the credential.

Verifier checks authenticity.

Admin operates the platform but should not secretly rewrite academic truth.

This separation must be visible in architecture.

---

# 58. BLOCKCHAIN TRUST MODEL

Blockchain is used for:

- tamper-evident proof;
- proof of issuance;
- integrity verification;
- status reference.

Blockchain is NOT used for:

- storing raw transcript PDF;
- storing sensitive private data;
- replacing institutional academic systems;
- making untrusted data magically truthful.

A blockchain record proves integrity/issuance according to the issuance process. It does not prove that an institution's underlying academic input was correct.

---

# 59. AI TRUST MODEL

AI is an assistant, not the authority.

Examples:

- eligibility = business rule;
- credential status = issuer/record;
- attendance = faculty action;
- selection = recruiter/TPO workflow;
- AI = recommendation/explanation/analysis.

---

# 60. UI DESIGN PRINCIPLES

Use one visual system.

Every dashboard should have:

- page title;
- summary cards;
- primary action;
- recent activity;
- data table/list;
- clear status;
- responsive layout.

Do not make 15 completely different dashboard designs.

---

# 61. ACCESSIBILITY MINIMUM

- keyboard-accessible controls;
- readable labels;
- sufficient contrast;
- form validation messages;
- no critical information conveyed only by color.

Advanced accessibility compliance is future, but basic usability is mandatory.

---

# 62. DEMO POLISH

Before judging:

- remove placeholder text;
- remove lorem ipsum;
- remove broken images;
- remove console errors;
- remove dead links;
- make all demo accounts functional;
- make every visible button either work or be clearly disabled;
- keep test/demo labels where necessary.

---

# 63. PRESENTATION STORY

The judges should understand three things quickly:

## Problem

Disconnected systems create:

- fragmented student experience;
- administrative inefficiency;
- unsafe campus operations;
- slow credential verification.

## Solution

One Campus OS.

## Proof

Live demo:

- AI career path;
- placement workflow;
- alumni;
- safety alert;
- credential issuance;
- blockchain/cryptographic verification.

---

# 64. WHAT NOT TO CLAIM IN PRESENTATION

Do not claim:

- "100% secure."
- "100% fraud-proof."
- "official VIT integration."
- "real CCTV AI" when simulated.
- "real GPS" when simulated.
- "government verified company" unless actually verified.
- "blockchain" if the demonstrated implementation is only a database table.
- "production-ready enterprise ERP" unless independently validated.

Use:

- "MVP";
- "prototype";
- "tamper-evident";
- "simulated hardware";
- "future production integration".

---

# 65. FINAL FROZEN PRIORITY MATRIX

| Area | Priority |
|---|---|
| Auth/RBAC | P0 |
| Student profile | P0 |
| Academic core | P0 |
| Attendance | P0 |
| Placement | P0 |
| TPO | P0 |
| Recruiter | P0 |
| Alumni | P0 |
| Career AI | P0 |
| Safety/SOS | P0 |
| Credential issuance | P0 |
| Credential verification | P0 |
| Cryptographic integrity | P0 |
| Ledger/blockchain adapter | P0 |
| QR | P0 |
| Revocation | P0 |
| Timetable | P0 |
| Results | P0 |
| Fees summary | P1 |
| Hostel | P1 |
| Transport simulation | P1 |
| AI mock interview | P0/P1 |
| Chatbot | P1 |
| Advanced analytics | P1 |
| Android | Future |
| Real CCTV | Future |
| Real GPS | Future |
| Face recognition | Future |
| Payments | Future |
| Full accounting | Future |
| Advanced DID/VC | Future |
| Enterprise blockchain network | Future unless event requires it |

---

# 66. RELEASE CRITERIA

The MVP is ready when:

1. deployed URL works;
2. all demo accounts work;
3. seeded data works;
4. authentication works;
5. RBAC works;
6. student flow works;
7. placement workflow works;
8. AI workflow works;
9. alumni workflow works;
10. safety workflow works;
11. credential issuance works;
12. credential verification works;
13. revocation works;
14. tampering failure can be demonstrated;
15. no real personal data is used;
16. backup exists;
17. local startup works;
18. no critical known bug remains.

---

# 67. FINAL DEMO CHECKLIST

```text
[ ] deployed frontend works
[ ] deployed API works
[ ] DB seed works
[ ] student login
[ ] faculty login
[ ] parent login
[ ] TPO login
[ ] recruiter login
[ ] alumni login
[ ] security login
[ ] institution login
[ ] verifier login

[ ] student dashboard
[ ] attendance
[ ] timetable
[ ] results
[ ] career readiness
[ ] skill gap
[ ] roadmap
[ ] resume analysis
[ ] placement application
[ ] recruiter shortlist
[ ] alumni mentorship
[ ] SOS
[ ] safety event
[ ] credential issuance
[ ] QR
[ ] verification
[ ] tamper detection
[ ] revocation

[ ] logs reviewed
[ ] secrets checked
[ ] backup created
[ ] fallback tested
[ ] demo flow rehearsed
```

---

# 68. FINAL TEAM CONTRACT

## Team 1 must never leave:

- broken auth;
- unstable database;
- conflicting schema;
- broken deployment.

## Team 2 must never assume:

- internal placement data can directly change another module's tables;
- recruiter should see all student data.

## Team 3 must never:

- claim simulated systems are real;
- hard-code private keys;
- let AI change critical business rules;
- silently replace architecture;
- modify shared auth/schema without approval.

---

# 69. FINAL IMPLEMENTATION RULE

When scope pressure appears:

```text
KEEP:
end-to-end workflow

REMOVE:
extra feature breadth
```

A complete workflow is more valuable than ten unfinished pages.

---

# 70. MASTER END STATE

The finished MVP should make this statement demonstrable:

> A student can use one platform for campus life, academics, safety, career preparation, placements, alumni support and trusted academic credentials. Institutional staff manage operations and placement, companies recruit verified candidates, alumni mentor students, and authorized verifiers can validate academic credentials without depending on manual back-and-forth verification.

That is the complete product.

---

# 71. HONEST LIMITATION

This document can freeze the **architecture, scope, ownership, interfaces and intended behavior**, but no document can guarantee a perfect implementation.

Actual quality depends on:

- coding quality;
- testing;
- integration;
- deployment environment;
- external API availability;
- time remaining;
- team discipline.

Therefore, the only acceptable interpretation of "follow blindly" is:

**Follow this plan without redesigning the architecture; still test every implementation detail.**

Never blindly trust generated code.

---

# 72. FINAL COMMANDMENT

### BUILD IN THIS ORDER

```text
CONTRACTS
  ↓
FOUNDATION
  ↓
CORE DATA
  ↓
ROLE ACCESS
  ↓
MODULES
  ↓
INTEGRATION
  ↓
AI
  ↓
CREDENTIAL TRUST
  ↓
SAFETY
  ↓
POLISH
  ↓
DEPLOY
  ↓
TEST
  ↓
DEMO
```

### NEVER

```text
FEATURE
 ↓
FEATURE
 ↓
FEATURE
 ↓
FEATURE
 ↓
"WE WILL INTEGRATE LATER"
```

That approach is how hackathon projects fail.

---

# 73. HANDOFF TO DEVELOPERS

Every developer receives:

1. this file;
2. the repository;
3. their module assignment;
4. the relevant module API specification;
5. seeded demo credentials;
6. Git branch ownership.

Before implementation:

- read this document;
- confirm local setup works;
- understand shared contracts;
- do not change architecture.

During implementation:

- work only in owned modules;
- follow contracts;
- write tests for critical logic;
- keep commits small;
- integrate daily.

Before merge:

- run build;
- run tests;
- verify API;
- verify authorization;
- verify no cross-module breakage.

Before demo:

- freeze features;
- seed database;
- deploy;
- rehearse exact demo flow;
- prepare fallback.

---

# 74. FINAL STATUS

**ARCHITECTURE: FROZEN**  
**MVP SCOPE: FROZEN**  
**TEAM OWNERSHIP: FROZEN**  
**API PRINCIPLES: FROZEN**  
**DATABASE DIRECTION: FROZEN**  
**WEB-FIRST: FROZEN**  
**ANDROID: FUTURE**  
**HARDWARE: SIMULATED/FUTURE**  
**BLOCKCHAIN: P0, ADAPTER-BASED**  
**AI: P0 FOR CAREER, P0/P1 FOR MOCK INTERVIEW**  
**DEMO DEPLOYMENT: REQUIRED**  
**MONOREPO/MODULAR DEVELOPMENT: REQUIRED**  
**P0 BEFORE P1: REQUIRED**

