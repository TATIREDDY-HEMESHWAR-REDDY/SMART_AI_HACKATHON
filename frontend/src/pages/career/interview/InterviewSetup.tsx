import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { Mic, Briefcase, Zap, AlertCircle } from 'lucide-react';

export default function InterviewSetup() {
  const navigate = useNavigate();

  const [role, setRole] = useState('Software Engineer');
  const [type, setType] = useState('MIXED');
  const [mode, setMode] = useState('QUICK');
  const [difficulty, setDifficulty] = useState('MEDIUM');

  const numQuestions = mode === 'QUICK' ? 3 : mode === 'FOCUSED' ? 5 : 10;

  const { mutate: startInterview, isPending, isError } = useMutation({
    mutationFn: interviewService.startInterview,
    onSuccess: (data) => {
      navigate(`/career/interview/session/${data.id}`);
    }
  });

  const handleStart = () => {
    startInterview({
      target_role: role,
      interview_type: type,
      mode,
      difficulty,
      num_questions: numQuestions
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configure Interview</h1>
        <p className="text-gray-500 mt-1">Set up your mock interview parameters to target specific skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* Role */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-indigo-500"/> Target Role</h3>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
              placeholder="e.g. Frontend Developer, Data Scientist..."
            />
          </div>

          {/* Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Mic className="w-5 h-5 mr-2 text-blue-500"/> Interview Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['TECHNICAL', 'BEHAVIORAL', 'HR', 'PROJECT', 'MIXED'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    type === t 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Mode & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500"/> Mode</h3>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'QUICK', label: 'Quick (3 Qs)' },
                  { id: 'FOCUSED', label: 'Focused (5 Qs)' },
                  { id: 'FULL', label: 'Full Mock (10 Qs)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium text-left transition-colors ${
                      mode === m.id 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Difficulty</h3>
              <div className="flex flex-col gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium text-left transition-colors ${
                      difficulty === d 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Session Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Target Role</div>
                <div className="font-medium text-gray-800">{role || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Type</div>
                <div className="font-medium text-gray-800">{type}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Difficulty</div>
                <div className="font-medium text-gray-800">{difficulty}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Length</div>
                <div className="font-medium text-gray-800">{numQuestions} Questions</div>
              </div>
            </div>

            {isError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Failed to create session. Please try again.</span>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={isPending || !role}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all shadow-sm flex items-center justify-center
                ${isPending || !role ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparing AI...
                </>
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
