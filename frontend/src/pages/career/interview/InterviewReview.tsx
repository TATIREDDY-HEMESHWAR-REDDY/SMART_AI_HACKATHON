import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { CheckCircle2, Target, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function InterviewReview() {
  const { id } = useParams();
  const sessionId = parseInt(id || '0');
  const navigate = useNavigate();

  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const { data: review, isLoading } = useQuery({
    queryKey: ['interview-review', sessionId],
    queryFn: () => interviewService.getReview(sessionId),
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
      <div className="h-48 bg-gray-200 rounded-xl"></div>
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>;
  }

  if (!review) return <div>Review not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wide mb-3">
            {review.interview_type} INTERVIEW
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{review.target_role || 'General Role'}</h1>
          <div className="flex items-center text-gray-500 text-sm gap-4">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {Math.round(review.duration_seconds / 60)} mins</span>
            <span>{new Date(review.started_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="mt-6 md:mt-0 flex flex-col items-center bg-gray-50 px-8 py-4 rounded-xl border border-gray-100">
          <div className="text-sm font-semibold text-gray-500 mb-1">Overall Score</div>
          <div className={`text-5xl font-bold ${
            !review.overall_score ? 'text-gray-400' :
            review.overall_score >= 80 ? 'text-green-600' : 
            review.overall_score >= 60 ? 'text-blue-600' : 'text-orange-500'
          }`}>
            {review.overall_score ? Math.round(review.overall_score) : '--'}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Target className="w-6 h-6 mr-3 text-blue-300" /> AI Performance Summary
        </h2>
        
        <p className="text-lg leading-relaxed text-blue-50 mb-8">
          {review.ai_summary?.overall_summary || 'Detailed summary is not available for this session.'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {review.ai_summary?.strengths && review.ai_summary.strengths.length > 0 && (
            <div className="bg-white/10 rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold text-green-300 mb-3">Key Strengths</h3>
              <ul className="space-y-2">
                {review.ai_summary.strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-blue-50">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-400 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.ai_summary?.critical_improvements && review.ai_summary.critical_improvements.length > 0 && (
            <div className="bg-white/10 rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold text-orange-300 mb-3">Critical Improvements</h3>
              <ul className="space-y-2">
                {review.ai_summary.critical_improvements.map((s: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-blue-50">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-400 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Question-by-Question Review</h3>
        
        {review.questions.map((q: any, idx: number) => {
          const isExpanded = expandedQ === q.id;
          const score = q.response?.score;
          const colorClass = !score ? 'bg-gray-100 text-gray-600' : score >= 80 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';

          return (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button 
                onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center flex-1 pr-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4 ${colorClass}`}>
                    {score ? Math.round(score) : '-'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Question {idx + 1} • {q.category}
                    </div>
                    <div className="font-medium text-gray-900 line-clamp-1">{q.question}</div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="text-gray-400 shrink-0" /> : <ChevronDown className="text-gray-400 shrink-0" />}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Question</h4>
                    <p className="text-gray-900">{q.question}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Answer</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-800 text-sm whitespace-pre-wrap border border-gray-100">
                      {q.response?.answer || 'No answer provided.'}
                    </div>
                  </div>
                  
                  {q.response?.feedback && (
                    <div className="bg-blue-50/50 rounded-lg p-5 border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-800 mb-3">AI Evaluation</h4>
                      <p className="text-sm text-gray-700 mb-4">{q.response.feedback}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.response.strengths && q.response.strengths.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-green-700 mb-1">Strengths</div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {q.response.strengths.map((s: string, i: number) => <li key={i} className="flex"><span className="text-green-500 mr-1">•</span>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {q.response.weaknesses && q.response.weaknesses.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-orange-700 mb-1">To Improve</div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {q.response.weaknesses.map((s: string, i: number) => <li key={i} className="flex"><span className="text-orange-500 mr-1">•</span>{s}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-center pt-8">
        <button 
          onClick={() => navigate('/career/interview')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
