import React from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Users, Briefcase, FileSearch } from 'lucide-react';

export const RecruiterDashboard = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  return (
    <RoleGuard allowedRoles={['RECRUITER']} userRoles={userRoles}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Recruitment Dashboard</h2>
          <p className="text-gray-500">
            Welcome to the Recruiter Portal. Manage your pipelines, review applicants, and shortlist candidates here.
          </p>
        </div>

        <div className="bg-white p-8 border rounded-xl shadow-sm text-center">
          <div className="flex justify-center mb-6 space-x-4">
            <div className="p-4 bg-indigo-50 rounded-full text-indigo-600"><Users size={32} /></div>
            <div className="p-4 bg-purple-50 rounded-full text-purple-600"><FileSearch size={32} /></div>
            <div className="p-4 bg-green-50 rounded-full text-green-600"><Briefcase size={32} /></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Recruitment Pipeline (Modules S, T, U)</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            This dedicated space ensures perfect role abstraction. TPOs manage the overarching placement drives, while you (the Recruiter) will manage applicant tracking, resume reviews, and shortlisting precisely from here.
          </p>
          <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-4 py-2 rounded-full border border-indigo-100">
            Pending unlocking in Phase 2
          </p>
        </div>
      </div>
    </RoleGuard>
  );
};
