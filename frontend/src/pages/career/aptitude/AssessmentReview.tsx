import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, XCircle, ArrowLeft, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssessmentReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: questions, isLoading: qsLoading } = useQuery({
    queryKey: ['attemptReview', id],
    queryFn: () => assessmentService.getReview(Number(id)),
    enabled: !!id
  });

  const { data: attempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['attemptDetails', id], // Reuse result cache to get user's answers
    queryFn: () => assessmentService.getAttempt(Number(id)),
    enabled: !!id
  });

  if (qsLoading || attemptLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!questions || !attempt) {
    return <div className="text-red-500 text-center p-8">Review not found.</div>;
  }

  const answersMap = (attempt.answers || []).reduce((acc: any, ans: any) => {
    acc[ans.question_id] = ans;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(`/career/attempts/${id}/result`)}
          className="flex items-center text-blue-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Result
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Review</h2>
        <p className="text-gray-500 mt-1">Review your answers and learn from explanations.</p>
      </div>

      <div className="space-y-8">
        {questions.map((q: any, idx: number) => {
          const userAns = answersMap[q.id];
          const isCorrect = userAns?.selected_option_id === q.correct_option_id;
          const isUnanswered = !userAns?.is_answered || !userAns?.selected_option_id;

          return (
            <Card key={q.id} className={cn("border-l-4", isCorrect ? "border-l-green-500" : isUnanswered ? "border-l-gray-300" : "border-l-red-500")}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-900 text-lg">Q{idx + 1}.</span>
                    <Badge variant="outline">{q.topic}</Badge>
                  </div>
                  <div>
                    {isCorrect && <Badge variant="success" className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Correct</Badge>}
                    {!isCorrect && !isUnanswered && <Badge variant="destructive" className="flex items-center"><XCircle className="w-3 h-3 mr-1"/> Incorrect</Badge>}
                    {isUnanswered && <Badge variant="outline">Unanswered</Badge>}
                  </div>
                </div>

                <h3 className="text-gray-800 font-medium text-lg mb-6 leading-relaxed">
                  {q.question_text}
                </h3>

                <div className="space-y-3 mb-6">
                  {q.options.map((opt: any) => {
                    const isSelected = userAns?.selected_option_id === opt.id;
                    const isActualCorrect = q.correct_option_id === opt.id;
                    
                    let bgClass = "bg-gray-50 border-gray-200";
                    if (isActualCorrect) bgClass = "bg-green-50 border-green-200 text-green-900";
                    else if (isSelected && !isActualCorrect) bgClass = "bg-red-50 border-red-200 text-red-900";

                    return (
                      <div key={opt.id} className={cn("p-4 rounded-lg border", bgClass, "flex items-center")}>
                        <div className="w-6 flex-shrink-0">
                          {isActualCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          {isSelected && !isActualCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <span className="ml-2 font-medium">{opt.text}</span>
                        {isSelected && <span className="ml-auto text-xs font-semibold uppercase tracking-wider opacity-60">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-1.5" /> Explanation
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
