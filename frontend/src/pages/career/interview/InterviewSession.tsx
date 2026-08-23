import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const sessionId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Queries
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['interview', sessionId],
    queryFn: () => interviewService.getInterview(sessionId),
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['interview-questions', sessionId],
    queryFn: () => interviewService.getQuestions(sessionId),
  });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Handle refresh preservation
  useEffect(() => {
    if (questions) {
      // Find the first unanswered question
      const nextUnanswered = questions.findIndex((q: any) => !q.response);
      if (nextUnanswered !== -1 && currentIdx === 0 && !answer) {
        setCurrentIdx(nextUnanswered);
      }
    }
  }, [questions]);

  // Mutations
  const submitMutation = useMutation({
    mutationFn: (data: { qId: number, ans: string, time: number }) => 
      interviewService.submitAnswer(sessionId, data.qId, data.ans, data.time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-questions', sessionId] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => interviewService.completeInterview(sessionId),
    onSuccess: () => {
      navigate(`/career/interview/${sessionId}/review`);
    }
  });

  if (sessionLoading || questionsLoading) {
    return <div className="animate-pulse h-full flex flex-col justify-center items-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-gray-500 font-medium">Loading Interview Session...</div>
    </div>;
  }

  if (session?.status === 'COMPLETED') {
    return (
      <div className="text-center py-20">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Completed</h2>
        <button 
          onClick={() => navigate(`/career/interview/${sessionId}/review`)}
          className="text-blue-600 hover:underline font-medium"
        >
          View Review
        </button>
      </div>
    );
  }

  const currentQ = questions?.[currentIdx];
  const isLastQ = currentIdx === (questions?.length || 0) - 1;
  const hasAnswered = !!currentQ?.response;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = () => {
    if (!currentQ || !answer.trim()) return;
    submitMutation.mutate({
      qId: currentQ.id,
      ans: answer,
      time: elapsed
    });
  };

  const handleNext = () => {
    if (isLastQ) {
      completeMutation.mutate();
    } else {
      setCurrentIdx(prev => prev + 1);
      setAnswer('');
      setStartTime(Date.now());
      setElapsed(0);
    }
  };

  if (!currentQ) return <div>No questions found.</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <div className="text-sm font-bold text-indigo-600 mb-1">CAREER OS INTERVIEW</div>
          <h2 className="text-xl font-semibold text-gray-800">
            {session?.target_role} ({session?.interview_type})
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center text-gray-600 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            {formatTime(elapsed)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
          <span>Question {currentIdx + 1} of {questions?.length}</span>
          <span>{Math.round(((currentIdx + (hasAnswered ? 1 : 0)) / (questions?.length || 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
          {questions?.map((q: any, i: number) => (
            <div 
              key={q.id} 
              className={`h-full border-r border-white/20 last:border-r-0 flex-1 ${
                q.response ? 'bg-green-500' : i === currentIdx ? 'bg-blue-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wide">
              {currentQ.category}
            </span>
            <span className="text-sm text-gray-400 font-medium">{currentQ.difficulty}</span>
          </div>
          <h3 className="text-2xl font-medium text-gray-900 leading-relaxed mb-6">
            {currentQ.question}
          </h3>
          
          {currentQ.expected_topics && currentQ.expected_topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {currentQ.expected_topics.map((t: string) => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}

          {!hasAnswered ? (
            <div className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your structured answer here. Consider using the STAR method if applicable..."
                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-shadow text-gray-800 leading-relaxed"
              />
              <div className="text-right text-xs text-gray-400">
                {answer.length} characters
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h4 className="text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">Your Answer</h4>
              <p className="text-gray-800 whitespace-pre-wrap mb-6">{currentQ.response?.answer}</p>
              
              <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" /> AI Evaluation
                  </h4>
                  {currentQ.response?.score !== null ? (
                    <span className={`text-xl font-bold ${currentQ.response!.score! >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                      {currentQ.response?.score}/100
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> Pending</span>
                  )}
                </div>
                
                <div className="space-y-4">
                  {currentQ.response?.strengths && currentQ.response.strengths.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-green-700 mb-1">Strengths</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {currentQ.response.strengths.map((s: string, i: number) => <li key={i} className="flex items-start"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {currentQ.response?.feedback && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">Feedback</div>
                      <p className="text-sm text-gray-600">{currentQ.response.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-white">
        <button
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {!hasAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitMutation.isPending}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center"
          >
            {submitMutation.isPending ? 'Evaluating...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={completeMutation.isPending}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center"
          >
            {completeMutation.isPending ? 'Finishing...' : isLastQ ? 'Complete Interview' : 'Next Question'}
            {!completeMutation.isPending && <ChevronRight className="w-5 h-5 ml-1" />}
          </button>
        )}
      </div>

    </div>
  );
}
