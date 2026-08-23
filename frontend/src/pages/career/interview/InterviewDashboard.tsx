import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { interviewService } from '@/services/interviewService';
import { Mic, Target, Clock, FileText, ChevronRight } from 'lucide-react';

export default function InterviewDashboard() {
  const navigate = useNavigate();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['interview-analytics'],
    queryFn: interviewService.getAnalytics,
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-64 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-3 gap-6"><div className="h-32 bg-gray-200 rounded-xl"></div><div className="h-32 bg-gray-200 rounded-xl"></div><div className="h-32 bg-gray-200 rounded-xl"></div></div>
    </div>;
  }

  const history = analytics?.history || [];
  const recentInterviews = history.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-10 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-10">
          <Mic size={200} />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Your AI Interview Coach</h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            Practice realistic interviews, get instant feedback, and identify exactly what to improve. Master your technical, behavioral, and system design interviews.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/career/interview/setup')}
              className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              Start Mock Interview
            </button>
            <button
              onClick={() => navigate('/career/interview/history')}
              className="bg-indigo-800 text-white border border-indigo-700 px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View History
            </button>
          </div>
        </div>
        <div className="relative z-10 hidden md:flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="text-sm font-medium text-blue-200 mb-2">Average Score</div>
          <div className="text-5xl font-bold text-white">
            {analytics?.average_score ? Math.round(analytics.average_score) : '--'}
          </div>
          <div className="text-xs text-blue-300 mt-2">{analytics?.total_interviews} Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2 text-gray-500 font-medium">
            <Target className="text-blue-500 w-5 h-5" /> Best Score
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics?.best_score ? Math.round(analytics.best_score) : '--'}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2 text-gray-500 font-medium">
            <FileText className="text-green-500 w-5 h-5" /> Total Interviews
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics?.total_interviews || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
          <h3 className="font-semibold text-gray-800 mb-2">Interview Types</h3>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded-md">Technical</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">Behavioral</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">HR</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">Project</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">Mixed</span>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Interviews</h2>
          {history.length > 0 && (
            <Link to="/career/interview/history" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Mic className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="font-medium text-gray-700">No interviews completed yet</p>
            <p className="text-sm mt-1 mb-4">Start your first mock interview to get AI-powered feedback.</p>
            <button 
              onClick={() => navigate('/career/interview/setup')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentInterviews.map((item: any) => (
              <Link key={item.id} to={`/career/interview/${item.id}/review`} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {item.overall_score ? Math.round(item.overall_score) : '-'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-800 transition-colors">{item.target_role || 'General Role'}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.interview_type}</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(item.started_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
