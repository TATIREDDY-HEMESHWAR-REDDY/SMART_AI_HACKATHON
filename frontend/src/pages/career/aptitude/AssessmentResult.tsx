import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';

import { CheckCircle2, XCircle, Clock, Lightbulb } from 'lucide-react';

export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading } = useQuery({
    queryKey: ['attemptResult', id],
    queryFn: () => assessmentService.getResult(Number(id)),
    enabled: !!id
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!result) {
    return <div className="text-red-500 text-center p-8">Result not found.</div>;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
        <p className="text-gray-500 text-lg">Great effort! Here is how you performed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
          <ScoreRing score={result.percentage} size={180} strokeWidth={14} />
          <div className="mt-4 text-center">
            <span className="font-medium text-gray-700">Total Score: {result.score}</span>
          </div>
        </Card>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-6 flex items-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-green-800">Correct</p>
                <p className="text-2xl font-bold text-green-900">{result.correct_answers}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-6 flex items-center">
              <XCircle className="w-10 h-10 text-red-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-red-800">Incorrect</p>
                <p className="text-2xl font-bold text-red-900">{result.incorrect_answers}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-gray-100">
            <CardContent className="p-6 flex items-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center mr-4 text-gray-400 font-bold">-</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unanswered</p>
                <p className="text-2xl font-bold text-gray-900">{result.unanswered}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-6 flex items-center">
              <Clock className="w-10 h-10 text-blue-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-blue-800">Time Taken</p>
                <p className="text-2xl font-bold text-blue-900">{formatTime(result.time_spent_seconds)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {result.ai_insight && (
        <Card className="border-purple-100 bg-purple-50/50">
          <CardHeader className="pb-3 border-b border-purple-100/50 flex flex-row items-center">
            <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
            <CardTitle className="text-purple-900">AI Performance Insight</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-purple-800 leading-relaxed whitespace-pre-wrap">{result.ai_insight}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4 mt-8">
        <button 
          onClick={() => navigate('/career/aptitude')}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
        <button 
          onClick={() => navigate(`/career/assessments/review/${id}`)}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Review Answers
        </button>
      </div>
    </div>
  );
}
