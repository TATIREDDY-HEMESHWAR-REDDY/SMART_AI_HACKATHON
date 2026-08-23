import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { interviewService } from '@/services/interviewService';
import { Mic, ChevronRight, Clock, Target } from 'lucide-react';

export default function InterviewHistory() {
  const navigate = useNavigate();
  const { data: history, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewService.listInterviews,
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
    </div>;
  }

  if (!history || history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
        <Mic className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Interviews Yet</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          You haven't completed any mock interviews. Start practicing to get AI-powered feedback on your skills.
        </p>
        <button 
          onClick={() => navigate('/career/interview/setup')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Start Your First Interview
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
          <p className="text-gray-500 mt-1">Review your past sessions and track your improvement.</p>
        </div>
        <button 
          onClick={() => navigate('/career/interview/setup')}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          New Interview
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item: any) => (
          <Link 
            key={item.id} 
            to={item.status === 'COMPLETED' ? `/career/interview/${item.id}/review` : `/career/interview/session/${item.id}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-5 mb-4 sm:mb-0">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                !item.overall_score ? 'bg-gray-100 text-gray-400' :
                item.overall_score >= 80 ? 'bg-green-100 text-green-700' : 
                item.overall_score >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {item.overall_score ? Math.round(item.overall_score) : '--'}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {item.target_role || 'General Role'}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center"><Target className="w-3 h-3 mr-1"/> {item.interview_type}</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(item.started_at).toLocaleDateString()}</span>
                  {item.status !== 'COMPLETED' && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-medium">In Progress</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end text-sm font-medium text-blue-600 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              {item.status === 'COMPLETED' ? 'View Review' : 'Resume Session'} <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
