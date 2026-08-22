import React, { useState, useEffect, useRef } from 'react';
import { RoleGuard } from '@campus-os/ui';
import { MessageSquare, PlayCircle, Send, CheckCircle, Brain, RefreshCw, AlertCircle } from 'lucide-react';

export const CareerMockInterview = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Starting a new interview
  const [starting, setStarting] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  
  // Active interview state
  const [activeInterview, setActiveInterview] = useState<any | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRoles = user?.roles || [];

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/career/mock-interview/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setInterviews(result.data.interviews);
        const inProgress = result.data.interviews.find((i: any) => i.status === 'IN_PROGRESS');
        if (inProgress) setActiveInterview(inProgress);
      } else {
        setError(result.error?.message || 'Failed to fetch interviews');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeInterview]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput) return;
    try {
      setStarting(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/v1/career/mock-interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: roleInput })
      });
      const result = await response.json();
      if (result.success) {
        setActiveInterview(result.data.interview);
        setRoleInput('');
        fetchInterviews();
      } else {
        setError(result.error?.message || 'Failed to start interview');
      }
    } catch (err) {
      setError('Start failed');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput || !activeInterview) return;
    try {
      setSubmittingAnswer(true);
      setError(null);
      const response = await fetch(`http://localhost:3000/api/v1/career/mock-interview/${activeInterview.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answer: answerInput })
      });
      const result = await response.json();
      if (result.success) {
        setAnswerInput('');
        setActiveInterview(result.data.interview);
        fetchInterviews();
      } else {
        setError(result.error?.message || 'Failed to submit answer');
      }
    } catch (err) {
      setError('Submit failed');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['STUDENT']} userRoles={userRoles}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 flex items-center space-x-3">
              <Brain className="w-8 h-8 text-indigo-600" />
              <span>AI Mock Interview</span>
            </h2>
            <p className="text-gray-500">Practice your interview skills with real-time deterministic AI evaluation.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            {!activeInterview && (
              <form onSubmit={handleStart} className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <PlayCircle className="w-5 h-5 text-indigo-600" />
                  <span>Start New Session</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                    <input 
                      type="text"
                      placeholder="e.g. Frontend Developer"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={starting || !roleInput}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {starting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                    <span>{starting ? 'Starting...' : 'Start Interview'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border rounded-xl p-6 shadow-sm h-[400px] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Interview History</h3>
              {loading ? (
                <div className="flex justify-center py-4"><RefreshCw className="w-6 h-6 animate-spin text-indigo-600" /></div>
              ) : interviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No past interviews.</p>
              ) : (
                <ul className="space-y-3">
                  {interviews.map(inv => (
                    <li 
                      key={inv.id} 
                      className={`p-3 rounded border text-sm cursor-pointer ${activeInterview?.id === inv.id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setActiveInterview(inv)}
                    >
                      <div className="font-semibold text-gray-800">{inv.feedback?.role || 'Interview'}</div>
                      <div className="flex justify-between items-center mt-1 text-gray-500">
                        <span>{inv.status}</span>
                        {inv.status === 'COMPLETED' && (
                          <span className="font-bold text-indigo-600">{inv.feedback?.totalScore}/100</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {activeInterview ? (
              <div className="bg-white border rounded-xl shadow-sm flex flex-col h-[650px]">
                <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Mock Interview: {activeInterview.feedback?.role || 'Role'}
                    </h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{activeInterview.status}</span>
                  </div>
                  {activeInterview.status === 'COMPLETED' && (
                    <div className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full">
                      Final Score: {activeInterview.feedback?.totalScore}/100
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
                  {activeInterview.feedback?.questions.map((q: any, i: number) => (
                    <div key={i} className="space-y-4">
                      {/* AI Question */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                          <Brain className="w-4 h-4" />
                        </div>
                        <div className="bg-white border rounded-xl rounded-tl-none p-4 shadow-sm text-gray-800 max-w-[80%]">
                          <p className="font-medium">{q.text}</p>
                        </div>
                      </div>

                      {/* User Answer */}
                      {q.answer && (
                        <div className="flex items-start space-x-3 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 ml-3 mr-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="bg-blue-600 text-white rounded-xl rounded-tr-none p-4 shadow-sm max-w-[80%]">
                            <p>{q.answer}</p>
                          </div>
                        </div>
                      )}

                      {/* Evaluation Feedback */}
                      {q.evaluation && (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-600 shrink-0">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-xl rounded-tl-none p-4 shadow-sm text-gray-800 max-w-[80%] text-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-green-800">Evaluation Feedback</span>
                              <span className="font-bold text-green-700">{q.evaluation.score}/100</span>
                            </div>
                            <p className="text-green-900 mb-2">{q.evaluation.comment}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-green-800 mt-2">
                              <div>Relevance: {q.evaluation.relevance}/10</div>
                              <div>Completeness: {q.evaluation.completeness}/10</div>
                              <div>Technical: {q.evaluation.technicalQuality}/10</div>
                              <div>Clarity: {q.evaluation.clarity}/10</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {activeInterview.status === 'COMPLETED' && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center mt-4">
                      <h4 className="font-bold text-indigo-900 mb-1">Interview Concluded</h4>
                      <p className="text-sm text-indigo-700">{activeInterview.feedback?.finalFeedback}</p>
                      <button 
                        onClick={() => setActiveInterview(null)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                      >
                        Start New Interview
                      </button>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {activeInterview.status === 'IN_PROGRESS' && (
                  <div className="p-4 bg-white border-t">
                    <form onSubmit={handleSubmitAnswer} className="flex space-x-2">
                      <textarea
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder="Type your answer here..."
                        className="flex-1 border rounded-lg p-3 text-sm focus:outline-none focus:ring focus:border-indigo-300 resize-none h-20"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitAnswer(e);
                          }
                        }}
                      ></textarea>
                      <button 
                        type="submit"
                        disabled={submittingAnswer || !answerInput.trim()}
                        className="bg-indigo-600 text-white rounded-lg px-4 flex flex-col justify-center items-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {submittingAnswer ? <RefreshCw className="w-5 h-5 animate-spin mb-1" /> : <Send className="w-5 h-5 mb-1" />}
                        <span className="text-xs font-medium">Send</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed rounded-xl flex flex-col items-center justify-center h-full text-center p-8">
                <Brain className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Session</h3>
                <p className="text-gray-500 max-w-sm">
                  Select a past interview from the history or start a new mock interview session to practice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};