import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { codingService } from '@/services/codingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Code2, Target } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function CodingDashboard() {
  const navigate = useNavigate();
  
  const { data: problems, isLoading } = useQuery({
    queryKey: ['codingProblems'],
    queryFn: () => codingService.getProblems()
  });

  const { data: submissions } = useQuery({
    queryKey: ['codingSubmissions'],
    queryFn: () => codingService.getSubmissions()
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const easy = problems?.filter((p: any) => p.difficulty === 'EASY') || [];
  const medium = problems?.filter((p: any) => p.difficulty === 'MEDIUM') || [];
  const hard = problems?.filter((p: any) => p.difficulty === 'HARD') || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <Code2 className="w-8 h-8 mr-3 text-blue-600" />
          Coding & DSA Platform
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Master Data Structures and Algorithms for your technical interviews.
        </p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Total Solved</h3>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-gray-900">0</span>
              <span className="text-sm text-gray-500 ml-2 mb-1">/ {problems?.length || 0}</span>
            </div>
            <div className="mt-4"><ProgressBar progress={0} /></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 text-green-600">Easy</h3>
            <span className="text-3xl font-bold text-gray-900">0<span className="text-lg text-gray-400 font-normal">/{easy.length}</span></span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 text-yellow-600">Medium</h3>
            <span className="text-3xl font-bold text-gray-900">0<span className="text-lg text-gray-400 font-normal">/{medium.length}</span></span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 text-red-600">Hard</h3>
            <span className="text-3xl font-bold text-gray-900">0<span className="text-lg text-gray-400 font-normal">/{hard.length}</span></span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Problem List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Problem Bank</h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-sm text-gray-600">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-2 text-center">Difficulty</div>
              <div className="col-span-3 text-center">Action</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {problems?.map((p: any) => (
                <div key={p.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-1 text-center">
                    <div className="w-2 h-2 rounded-full bg-gray-200 mx-auto"></div>
                  </div>
                  <div className="col-span-6">
                    <a href={`/career/coding/problems/${p.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 hover:underline">
                      {p.title}
                    </a>
                    <div className="text-xs text-gray-500 mt-1">{p.topic}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant={p.difficulty === 'EASY' ? 'success' : p.difficulty === 'MEDIUM' ? 'warning' : 'destructive'} className="text-xs">
                      {p.difficulty}
                    </Badge>
                  </div>
                  <div className="col-span-3 text-center">
                    <button 
                      onClick={() => navigate(`/career/coding/problems/${p.slug}`)}
                      className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-100"
                    >
                      Solve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-gray-500" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((sub: any) => (
                    <div key={sub.id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{sub.language}</div>
                        <div className="text-gray-500 text-xs">{new Date(sub.submitted_at).toLocaleDateString()}</div>
                      </div>
                      <Badge variant={sub.status === 'ACCEPTED' ? 'success' : 'destructive'}>
                        {sub.status === 'ACCEPTED' ? 'Accepted' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No submissions yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
