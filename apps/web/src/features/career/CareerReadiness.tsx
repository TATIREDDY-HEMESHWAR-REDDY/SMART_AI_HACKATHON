import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RoleGuard } from '@campus-os/ui';
import { Target, AlertCircle, Loader2, Info } from 'lucide-react';

interface ReadinessMetrics {
  hasCareerGoal: boolean;
  assessmentsCompleted: number;
  skillsAcquired: number;
}

interface Readiness {
  score: number | null;
  status: string;
  metrics?: ReadinessMetrics;
  lastUpdated: string;
}

export const CareerReadiness = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readiness, setReadiness] = useState<Readiness | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/career/readiness/me');
        const json = await res.json();
        if (json.success) {
          setReadiness(json.data.readiness);
        } else {
          setError(json.error?.message || 'Failed to fetch readiness data.');
        }
      } catch (err) {
        setError('Failed to fetch readiness data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  return (
    <RoleGuard allowedRoles={['STUDENT']} userRoles={userRoles}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Career Readiness & Skill Gap</h2>
          <p className="text-gray-500">Track your progress toward your target role and identify areas for improvement.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Readiness Score Card */}
          <div className="col-span-1 border rounded-xl p-6 bg-white shadow-sm flex flex-col items-center">
            <h3 className="font-semibold text-gray-700 uppercase tracking-wide text-sm mb-6">Readiness Summary</h3>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center mb-6 w-full">
              <span className="block text-2xl font-bold text-blue-800 mb-1">
                {readiness?.score !== null ? readiness?.score : 'TBD'}
              </span>
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                {readiness?.status || 'Unknown'}
              </span>
            </div>

            <div className="w-full bg-gray-50 rounded-lg p-4 border space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase">Profile Metrics</h4>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Career Goal Set</span>
                <span className={`font-semibold ${readiness?.metrics?.hasCareerGoal ? 'text-green-600' : 'text-gray-400'}`}>
                  {readiness?.metrics?.hasCareerGoal ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Assessments Completed</span>
                <span className="font-semibold text-indigo-600">{readiness?.metrics?.assessmentsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Skills Acquired</span>
                <span className="font-semibold text-indigo-600">{readiness?.metrics?.skillsAcquired || 0}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-start space-x-2 text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p><strong>TEAM LEAD CLARIFICATION REQUIRED:</strong> Official Readiness scoring formula is pending.</p>
            </div>
          </div>

          {/* Skill Gap Analysis (Pending) */}
          <div className="col-span-1 border rounded-xl p-6 bg-white shadow-sm flex flex-col items-center justify-center text-center">
            <Target className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Skill Gap Analysis</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              This feature relies on the AI Career Roadmap engine to analyze your profile against industry requirements.
            </p>
            
            <Link 
              to="/roadmap"
              className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 px-6 py-3 rounded-lg font-medium transition-colors border border-indigo-100"
            >
              <span>View Career Roadmap</span>
            </Link>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
