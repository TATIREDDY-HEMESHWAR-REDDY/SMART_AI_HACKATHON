import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, HelpCircle, AlertTriangle, ListChecks } from 'lucide-react';

export default function AssessmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getAssessment(Number(id)),
    enabled: !!id
  });

  const startMutation = useMutation({
    mutationFn: (aid: number) => assessmentService.startAttempt(aid),
    onSuccess: () => {
      navigate(`/career/assessments/${id}/attempt`);
    }
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!assessment) {
    return <div className="text-red-500">Assessment not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/career/aptitude')}
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          &larr; Back to Aptitude
        </button>
        <h2 className="text-3xl font-bold text-gray-900">{assessment.title}</h2>
        {assessment.description && (
          <p className="text-gray-500 mt-2 text-lg">{assessment.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Questions</p>
                  <p className="font-semibold text-gray-900">{assessment.total_questions}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Duration</p>
                  <p className="font-semibold text-gray-900">{assessment.duration_minutes} minutes</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Difficulty</p>
                  <p className="font-semibold text-gray-900 capitalize">{assessment.difficulty.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <ListChecks className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Passing Score</p>
                  <p className="font-semibold text-gray-900">{assessment.passing_score}%</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Ensure you have a stable internet connection.</li>
                <li>Do not refresh the page during the assessment.</li>
                <li>You can mark questions for review and return to them later.</li>
                <li>The assessment will auto-submit when the timer reaches zero.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col h-full justify-center">
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-3">{assessment.category}</Badge>
              <h3 className="text-xl font-bold text-gray-900">Ready to begin?</h3>
              <p className="text-gray-500 text-sm mt-2">Make sure you have {assessment.duration_minutes} minutes of uninterrupted time.</p>
            </div>
            
            <button
              onClick={() => startMutation.mutate(assessment.id)}
              disabled={startMutation.isPending}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
            >
              {startMutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Start Assessment'
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
