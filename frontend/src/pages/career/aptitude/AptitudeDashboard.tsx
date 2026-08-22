import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '@/services/assessmentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BrainCircuit, Clock, HelpCircle, Trophy } from 'lucide-react';

export default function AptitudeDashboard() {
  const navigate = useNavigate();
  
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', 'APTITUDE'],
    queryFn: () => assessmentService.getAssessments('APTITUDE'),
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-blue-600" />
          Aptitude Practice
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Master quantitative, logical, and verbal skills to ace your placement tests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments?.map((assessment: any) => (
          <Card key={assessment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <Badge variant={assessment.difficulty === 'EASY' ? 'success' : assessment.difficulty === 'MEDIUM' ? 'warning' : 'destructive'}>
                  {assessment.difficulty}
                </Badge>
                {assessment.topic && <Badge variant="outline">{assessment.topic}</Badge>}
              </div>
              <CardTitle className="mt-3 text-xl">{assessment.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-5">
              <div className="flex space-x-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-1 text-gray-400" />
                  {assessment.total_questions} Qs
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {assessment.duration_minutes} Mins
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-1 text-gray-400" />
                  Pass: {assessment.passing_score}%
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/career/assessments/${assessment.id}`)}
                className="w-full py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Assessment
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
