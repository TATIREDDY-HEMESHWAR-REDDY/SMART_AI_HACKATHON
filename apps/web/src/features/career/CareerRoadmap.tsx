import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { Target, Map, BookOpen, Brain, Briefcase, FileCode2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export const CareerRoadmap = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/career/roadmap/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data.roadmap);
        } else {
          setError(result.error?.message || 'Failed to fetch roadmap');
        }
      } catch (err) {
        setError('Network error while fetching roadmap');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  return (
    <RoleGuard allowedRoles={['STUDENT']} userRoles={userRoles}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Career Roadmap</h2>
            <p className="text-gray-500">Your AI-generated personalized skill gap analysis and learning sequence.</p>
          </div>
          {data && (
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-xs text-indigo-600 uppercase font-semibold">Target Role</div>
                <div className="font-bold text-lg text-indigo-900">{data.targetRole} <span className="text-sm font-normal text-indigo-600">in {data.targetIndustry}</span></div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">Cannot Generate Roadmap</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Missing Skills */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold">Identified Skill Gaps</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.skillGap.missingSkills.map((skill: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-50 border flex justify-between items-center">
                    <span className="font-medium text-gray-800">{skill.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${skill.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                      {skill.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Sequence */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <Map className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold">Recommended Learning Sequence</h3>
                </div>
                <div className="space-y-4">
                  {data.skillGap.learningSequence.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-4 p-4 border rounded-lg bg-indigo-50/50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 font-medium pt-1">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Resources */}
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold">Suggested Resources</h3>
                  </div>
                  <ul className="space-y-3">
                    {data.skillGap.suggestedResources.map((res: any, idx: number) => (
                      <li key={idx} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-800">{res.title}</p>
                          <p className="text-xs text-gray-500 uppercase">{res.type}</p>
                        </div>
                        <a href={res.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 p-2">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Projects */}
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileCode2 className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold">Project Suggestions</h3>
                  </div>
                  <div className="space-y-4">
                    {data.skillGap.projectSuggestions.map((proj: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-800">{proj.title}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">{proj.difficulty}</span>
                        </div>
                        <p className="text-sm text-gray-600">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-8">
              AI Roadmap last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
};
