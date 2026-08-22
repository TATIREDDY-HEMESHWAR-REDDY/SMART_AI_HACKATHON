import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import CareerDashboard from '@/pages/career/CareerDashboard';
import CareerProfile from '@/pages/career/CareerProfile';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/career" replace />} />
      <Route path="/career" element={<MainLayout />}>
        <Route index element={<CareerDashboard />} />
        <Route path="profile" element={<CareerProfile />} />
        {/* Placeholders for future phases */}
        <Route path="assessments" element={<div className="p-4">Assessments Module (Phase 3)</div>} />
        <Route path="coding" element={<div className="p-4">Coding Module (Phase 4)</div>} />
        <Route path="resume" element={<div className="p-4">Resume Module (Phase 5)</div>} />
        <Route path="jobs" element={<div className="p-4">Jobs Module (Phase 7)</div>} />
        <Route path="roadmap" element={<div className="p-4">Roadmap Module (Phase 8)</div>} />
        <Route path="coach" element={<div className="p-4">AI Coach Module (Phase 8)</div>} />
        <Route path="analytics" element={<div className="p-4">Analytics Module (Phase 8)</div>} />
      </Route>
    </Routes>
  );
}
