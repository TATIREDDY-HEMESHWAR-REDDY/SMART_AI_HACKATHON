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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/career" replace />} />
      
      {/* Standalone assessment route (no layout) */}
      <Route path="/career/assessments/:id/attempt" element={<AssessmentAttempt />} />
      <Route path="/career/coding/problems/:slug" element={<ProblemWorkspace />} />
      
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
        <Route path="jobs" element={<div className="p-4">Jobs Module (Phase 7)</div>} />
        <Route path="roadmap" element={<div className="p-4">Roadmap Module (Phase 8)</div>} />
        <Route path="coach" element={<div className="p-4">AI Coach Module (Phase 8)</div>} />
        <Route path="analytics" element={<div className="p-4">Analytics Module (Phase 8)</div>} />
      </Route>
    </Routes>
  );
}
