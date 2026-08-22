import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import { assessmentService } from '@/services/assessmentService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, Flag, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssessmentAttempt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // 1. Fetch Attempt to get status and answers
  const { data: attempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['attempt', id],
    queryFn: () => assessmentService.startAttempt(Number(id)), // Will resume if in progress
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  // 2. Fetch Questions (only allowed if attempt is IN_PROGRESS)
  const { data: questions, isLoading: qsLoading } = useQuery({
    queryKey: ['assessmentQuestions', id],
    queryFn: () => assessmentService.getQuestions(Number(id)),
    enabled: !!attempt && attempt.status === 'IN_PROGRESS',
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => assessmentService.saveAnswer(attempt.id, data)
  });

  const submitMutation = useMutation({
    mutationFn: () => assessmentService.submitAttempt(attempt.id),
    onSuccess: () => {
      navigate(`/career/attempts/${attempt.id}/result`, { replace: true });
    }
  });

  // Initialize state from attempt data
  useEffect(() => {
    if (attempt && attempt.status === 'IN_PROGRESS') {
      if (timeLeft === null && attempt.time_remaining_seconds !== undefined) {
        setTimeLeft(attempt.time_remaining_seconds);
      }
      
      if (attempt.answers && Object.keys(answers).length === 0) {
        const initialAnswers: Record<number, any> = {};
        attempt.answers.forEach((ans: any) => {
          initialAnswers[ans.question_id] = ans;
        });
        setAnswers(initialAnswers);
      }
    } else if (attempt && attempt.status === 'SUBMITTED') {
       navigate(`/career/attempts/${attempt.id}/result`, { replace: true });
    }
  }, [attempt, answers, timeLeft, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timerId);
          submitMutation.mutate(); // Auto submit
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleOptionSelect = (questionId: number, optionId: string) => {
    const newAnswer = {
      ...answers[questionId],
      question_id: questionId,
      selected_option_id: optionId,
      is_answered: true,
      marked_for_review: answers[questionId]?.marked_for_review || false,
    };
    
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    
    // Auto-save to backend
    saveMutation.mutate(newAnswer);
  };

  const toggleReview = (questionId: number) => {
    const currentAns = answers[questionId] || { question_id: questionId };
    const newAnswer = {
      ...currentAns,
      marked_for_review: !currentAns.marked_for_review,
      is_answered: currentAns.is_answered || false,
      selected_option_id: currentAns.selected_option_id || null
    };
    
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    saveMutation.mutate(newAnswer);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (attemptLoading || qsLoading || !questions) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assessment in Progress</h1>
          <p className="text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm text-gray-500 flex items-center">
            {saveMutation.isPending ? 'Saving...' : 'All changes saved'}
          </div>
          <div className={cn("flex items-center px-4 py-2 rounded-lg font-mono text-lg font-medium", 
            (timeLeft || 0) < 300 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700"
          )}>
            <Clock className="w-5 h-5 mr-2" />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
                submitMutation.mutate();
              }
            }}
            disabled={submitMutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-md">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex space-x-3">
                  <Badge variant="outline">{currentQuestion.topic}</Badge>
                  <Badge variant={currentQuestion.difficulty === 'EASY' ? 'success' : currentQuestion.difficulty === 'MEDIUM' ? 'warning' : 'destructive'}>
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  +{currentQuestion.marks} / -{currentQuestion.negative_marks} marks
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                  {currentQuestion.question_text}
                </h3>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center",
                        currentAnswer.selected_option_id === option.id 
                          ? "border-blue-600 bg-blue-50/50" 
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="mr-4">
                        {currentAnswer.selected_option_id === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => toggleReview(currentQuestion.id)}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentAnswer.marked_for_review 
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {currentAnswer.marked_for_review ? 'Marked for Review' : 'Mark for Review'}
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </main>

        {/* Sidebar Navigator */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col hidden lg:flex">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Question Navigator</h3>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q: any, idx: number) => {
                const ans = answers[q.id] || {};
                const isCurrent = idx === currentIndex;
                const isAnswered = ans.is_answered;
                const isReview = ans.marked_for_review;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                      isCurrent ? "ring-2 ring-blue-600 ring-offset-2" : "",
                      isReview ? "bg-amber-100 border-amber-300 text-amber-800" 
                      : isAnswered ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-3 text-sm text-gray-600">
              <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-600 mr-3"></div> Answered</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded-full border-2 border-gray-200 mr-3"></div> Not Answered</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-300 mr-3"></div> Marked for Review</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
