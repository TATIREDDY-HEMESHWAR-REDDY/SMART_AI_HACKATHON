import React, { useState } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Brain, FileCheck2, Activity, PlayCircle, Loader2, ArrowLeft } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
}

interface AssessmentResult {
  id: string;
  assessment: Assessment;
  score: number;
  strengths: string[];
  weaknesses: string[];
  completedAt: string;
}

interface AssessmentSession {
  id: string;
  assessmentId: string;
  status: 'IN_PROGRESS' | 'EVALUATING';
  startedAt: string;
}

export const CareerAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [readiness, setReadiness] = useState<{ score: number; status: string; lastUpdated: string } | null>(null);
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'results'>('available');

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setFetchError('');
    try {
      // For this slice, using fetch directly against our local API paths
      // Assuming authorization token is either mocked or handled globally by the browser session
      
      const [assessmentsRes, resultsRes, readinessRes] = await Promise.all([
        fetch('/api/v1/career/assessments').then(res => res.json()),
        fetch('/api/v1/career/assessments/me/results').then(res => res.json()),
        fetch('/api/v1/career/readiness/me').then(res => res.json())
      ]);

      if (assessmentsRes.success) setAssessments(assessmentsRes.data.assessments);
      if (resultsRes.success) setResults(resultsRes.data.assessmentResults);
      if (readinessRes.success) setReadiness(readinessRes.data.readiness);
      
    } catch (err: any) {
      setFetchError('Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/career/assessments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: id })
      });
      const data = await response.json();
      
      if (data.success) {
        setActiveSession(data.data.assessmentSession);
      } else {
        alert('Failed to start assessment: ' + data.error?.message);
      }
    } catch (err) {
      alert('Network error while starting assessment');
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = () => {
    setActiveSession(null);
  };

  if (activeSession) {
    const assessment = assessments.find(a => a.id === activeSession.assessmentId);
    return (
      <RoleGuard allowedRoles={['STUDENT']} userRoles={['STUDENT']}>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <button 
            onClick={cancelSession}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
            <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Taking Assessment</h2>
            <p className="text-gray-500 mb-6">
              You are currently in an active session for <strong>{assessment?.title}</strong>.<br/>
              The assessment has been initialized and is waiting for AI evaluation.
            </p>
            
            <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg inline-block text-left mb-6">
              <h3 className="font-semibold mb-1">Session Status</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Session ID: {activeSession.id.slice(0, 8)}...</li>
                <li>Started: {new Date(activeSession.startedAt).toLocaleTimeString()}</li>
                <li>Status: {activeSession.status}</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-400">
              Note: Results are not yet available. Please complete the interactive questions (Team 3 AI integration).
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <>
      {/* TODO: Temporarily hardcoding userRoles={['STUDENT']} due to Team 1 mock auth limitation. */}
      <RoleGuard allowedRoles={['STUDENT']} userRoles={['STUDENT']}>
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Career Assessment</h2>
            {readiness && (
              <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg flex items-center space-x-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-blue-600 uppercase font-semibold">Readiness Score</div>
                  <div className="font-bold text-lg">{readiness.score}/100 <span className="text-sm font-normal text-gray-600">({readiness.status})</span></div>
                </div>
              </div>
            )}
          </div>

          {fetchError && <div className="text-red-500 bg-red-50 p-4 rounded-md">{fetchError}</div>}

          {/* Tabs */}
          <div className="flex space-x-4 border-b">
            <button 
              onClick={() => setActiveTab('available')}
              className={`pb-2 px-1 font-medium ${activeTab === 'available' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Available Assessments
            </button>
            <button 
              onClick={() => setActiveTab('results')}
              className={`pb-2 px-1 font-medium ${activeTab === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Past Results
            </button>
          </div>

          {/* Content */}
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
              <>
                {activeTab === 'available' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map(assessment => (
                      <div key={assessment.id} className="border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <Brain className="w-8 h-8 text-indigo-600" />
                          <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{assessment.type}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{assessment.title}</h3>
                        <p className="text-gray-500 text-sm mb-6">{assessment.durationMinutes} minutes • AI Evaluated</p>
                        <button 
                          onClick={() => startAssessment(assessment.id)}
                          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Start Assessment</span>
                        </button>
                      </div>
                    ))}
                    {assessments.length === 0 && <p className="text-gray-500">No assessments available right now.</p>}
                  </div>
                )}

                {activeTab === 'results' && (
                  <div className="space-y-6">
                    {results.map(result => (
                      <div key={result.id} className="border rounded-xl p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 pr-0 md:pr-4">
                          <h3 className="font-bold text-lg">{result.assessment?.title}</h3>
                          <div className="text-sm text-gray-500 mt-1">{new Date(result.completedAt).toLocaleDateString()}</div>
                          <div className="mt-4 flex items-center space-x-3">
                            <div className="text-3xl font-bold text-green-600">{result.score}%</div>
                            <FileCheck2 className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">Key Strengths</h4>
                            <ul className="space-y-1">
                              {result.strengths.map((str, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">Areas for Improvement</h4>
                            <ul className="space-y-1">
                              {result.weaknesses.map((weak, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                  <span>{weak}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                    {results.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Assessment Results</h3>
                        <p className="text-gray-500">Take an assessment to see your career readiness.</p>
                        <button 
                          onClick={() => setActiveTab('available')} 
                          className="mt-4 text-indigo-600 font-medium hover:underline"
                        >
                          View Available Assessments
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </RoleGuard>
    </>
  );
};
