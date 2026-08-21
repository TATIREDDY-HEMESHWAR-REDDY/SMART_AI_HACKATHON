# HAYAGRIVA VIDYA KENDRAM (Monorepo)

Welcome to the **HAYAGRIVA VIDYA KENDRAM** master repository. This repository implements a unified campus ERP, career preparation system, and digital credential wallet for a fictional VIT Chennai-style campus model.

This document serves as the **Single Source of Truth** for the repository structure, branch workflow, coding contracts, and integration guidelines.

---

## 🛠️ Tech Stack & Prerequisites

*   **Package Manager:** `pnpm` (Workspace-enabled) — **Do not use npm or yarn.**
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query
*   **Backend:** Node.js, Fastify (or Express), TypeScript, Prisma ORM, PostgreSQL
*   **AI Service:** Python, FastAPI, Pydantic, Gemini/LLM Wrapper
*   **Ledger & Blockchain:** Tamper-evident ledger adapter with signature verification (SHA-256)

---

## 📁 Repository Structure

We follow a **Modular Monolith** style to prevent deployment problems, network failures, and integration issues:

```text
campus-os/
├── apps/
│   ├── web/                     # React + Vite Frontend (Shared AppShell, Role Guards)
│   ├── api/                     # Node.js + Fastify Modular Monolith Backend
│   └── ai-service/              # Python FastAPI AI Service (Resume, Career roadmaps, Mock interviews)
│
├── packages/
│   ├── types/                   # Shared TypeScript interface definitions
│   ├── validation/              # Shared Zod validation schemas
│   ├── ui/                      # Shared UI components (AppShell, Sidebar, Table, status badges)
│   └── config/                  # Shared configs (ESLint, Tailwind, TypeScript configs)
│
├── services/
│   ├── credentials/             # Credential service core modules (issuance, revocation)
│   └── blockchain/              # Ledger and blockchain proof adapters
│
├── prisma/
│   ├── schema.prisma            # Master database schema (Owned by Teammate 1)
│   └── seed.ts                  # Comprehensive demo seed data script (VIT-Chennai model)
│
├── docs/                        # API contracts, workflows, architecture & ADRs
└── scripts/                     # Helper setup and backup scripts
```

---

## 👥 Team Ownership & Modules

To avoid merge conflicts, work is strictly partitioned. Do not edit another teammate's module without explicit coordination.

| Teammate | Focus Area | Owned Modules / Features |
| :--- | :--- | :--- |
| **Teammate 1** *(You)* | **Platform + ERP + DevOps** | Repository Foundation, Auth, RBAC, Users/Profiles, Academics, Attendance, Results, Timetable, Fees, Complaints, Hostel, Transport, Prisma Schema Owner, Notification/Database foundation, deployment. |
| **Teammate 2** | **Career & Placement** | Career Profile, Skill catalog, Assessment UI, Roadmaps, Resumes, Placement drives, Eligibility Engine, Applications, Recruiters, Alumni Mentorship, Referrals. |
| **Teammate 3** | **AI + Safety + Credentials** | Python AI Service, Mock Interview Engine, SOS and safety incidents, Security dashboard, Credential issuance/revocation, Cryptographic signatures, Blockchain/Ledger Adapter, QR verification. |

---

## 🌿 Git Strategy & Branch Workflow

We use a structured branch topology to protect the codebase and facilitate integration.

### Core Branches
*   `main`: Deployed production-ready code. **Never commit directly to main.**
*   `develop`: The daily integration branch. All feature branches merge here first.

### Team Feature Branches
Each teammate has a primary feature branch for their respective modules:
1.  **Teammate 1 (Core & ERP):** `feature/core-platform`
2.  **Teammate 2 (Career & Placement):** `feature/career-placement`
3.  **Teammate 3 (AI, Safety & Credentials):** `feature/ai-safety-credentials`

### Sub-branches (Optional)
When working on specific sub-tasks, create sub-branches off your feature branch:
*   `feature/core-platform/auth`
*   `feature/career-placement/eligibility`
*   `feature/ai-safety-credentials/signatures`

### Merge Conflict Prevention & Rules
1.  **Prisma Schema updates:** Teammate 1 is the primary owner of `prisma/schema.prisma`. Teammates 2 and 3 should request DB model additions from Teammate 1, or coordinate before running migration commands.
2.  **Shared Files:** Coordinate modifying root `package.json`, root configs, and shared types.
3.  **Daily Integration Flow:**
    *   Every morning, pull the latest changes from `develop` into your local feature branch.
    *   Resolve conflicts locally.
    *   Work on small, atomic commits using [Semantic Commits](https://www.conventionalcommits.org/):
        *   `feat(auth): add role-aware session`
        *   `feat(placement): add eligibility engine`
        *   `fix(recruiter): restrict candidate fields`
    *   Submit a Pull Request (PR) to merge your work back into `develop`.
    *   Do **not** perform giant, end-of-day merges without code reviews.

---

## 🚀 Getting Started

### Installation
Ensure you have `pnpm` installed globally:
```bash
npm install -g pnpm
```

Install dependencies at the root of the project:
```bash
pnpm install
```

### Database Setup
1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Configure your local PostgreSQL connection string in `.env`.
3.  Run migrations and generate the Prisma client:
    ```bash
    pnpm db:migrate
    pnpm prisma:generate
    ```
4.  Seed the database with mock student and faculty data:
    ```bash
    pnpm db:seed
    ```

### Running Development Servers
To boot all apps (Frontend, Backend API, and AI Service) in parallel:
```bash
pnpm dev
```
Or boot them individually:
*   Frontend Web: `pnpm dev:web`
*   Backend API: `pnpm dev:api`
*   AI Service: `pnpm dev:ai`

---

## 🎨 UI/UX and API Guidelines

### Shared Component Contract
Use and extend the components in `packages/ui` rather than creating duplicates:
*   `AppShell`, `Sidebar`, `Topbar` (for layouts)
*   `RoleGuard` and `PermissionGuard` (for path/view protection)
*   `DataTable`, `StatusBadge`, `NotificationBell`

### API Design Standards
All endpoints must use prefix `/api/v1` and follow standard REST principles. Every API call must return the standard response envelopes:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid enrollment number."
  }
}
```
Use Zod schemas in `packages/validation` to validate requests at runtime.
