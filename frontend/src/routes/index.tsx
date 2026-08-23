import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import CareerDashboard from '@/pages/career/CareerDashboard';
import CareerProfile from '@/pages/career/CareerProfile';

import AptitudeDashboard from '@/pages/career/aptitude/AptitudeDashboard';
import AssessmentDetails from '@/pages/career/aptitude/AssessmentDetails';
import AssessmentAttempt from '@/pages/career/aptitude/AssessmentAttempt';
import AssessmentResult from '@/pages/career/aptitude/AssessmentResult';
import AssessmentReview from '@/pages/career/aptitude/AssessmentReview';

import TechnicalDashboard from '@/pages/career/technical/TechnicalDashboard';
import CommunicationDashboard from '@/pages/career/communication/CommunicationDashboard';

import CodingDashboard from '@/pages/career/coding/CodingDashboard';
import ProblemWorkspace from '@/pages/career/coding/ProblemWorkspace';
import ResumeBuilder from '@/pages/career/resume/ResumeBuilder';

import InterviewDashboard from '@/pages/career/interview/InterviewDashboard';
import InterviewSetup from '@/pages/career/interview/InterviewSetup';
import InterviewSession from '@/pages/career/interview/InterviewSession';
import InterviewReview from '@/pages/career/interview/InterviewReview';
import InterviewHistory from '@/pages/career/interview/InterviewHistory';

import JobsDashboard from '@/pages/career/jobs/JobsDashboard';
import JobDetails from '@/pages/career/jobs/JobDetails';

import ApplicationsDashboard from '@/pages/career/jobs/ApplicationsDashboard';
import ApplicationDetails from '@/pages/career/jobs/ApplicationDetails';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/career" replace />} />
      
      {/* Standalone assessment route (no layout) */}
      <Route path="/career/assessments/:id/attempt" element={<AssessmentAttempt />} />
      <Route path="/career/coding/problems/:slug" element={<ProblemWorkspace />} />
      <Route path="/career/interview/session/:id" element={<InterviewSession />} />
      
      <Route path="/career" element={<MainLayout />}>
        <Route index element={<CareerDashboard />} />
        <Route path="profile" element={<CareerProfile />} />
        
        {/* Aptitude & Assessments */}
        <Route path="aptitude" element={<AptitudeDashboard />} />
        <Route path="technical" element={<TechnicalDashboard />} />
        <Route path="communication" element={<CommunicationDashboard />} />
        <Route path="coding" element={<CodingDashboard />} />
        
        <Route path="assessments/:id" element={<AssessmentDetails />} />
        <Route path="attempts/:id/result" element={<AssessmentResult />} />
        <Route path="assessments/review/:id" element={<AssessmentReview />} />
        
        {/* Placeholders for future phases */}
        <Route path="resume" element={<ResumeBuilder />} />
        
        {/* Interview Module */}
        <Route path="interview" element={<InterviewDashboard />} />
        <Route path="interview/setup" element={<InterviewSetup />} />
        <Route path="interview/history" element={<InterviewHistory />} />
        <Route path="interview/:id/review" element={<InterviewReview />} />

        {/* Jobs Module */}
        <Route path="jobs" element={<JobsDashboard />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        
        {/* Applications Tracker */}
        <Route path="applications" element={<ApplicationsDashboard />} />
        <Route path="applications/:id" element={<ApplicationDetails />} />

        <Route path="roadmap" element={<div className="p-4">Roadmap Module (Phase 8)</div>} />
        <Route path="coach" element={<div className="p-4">AI Coach Module (Phase 8)</div>} />
        <Route path="analytics" element={<div className="p-4">Analytics Module (Phase 8)</div>} />
      </Route>
    </Routes>
  );
}
