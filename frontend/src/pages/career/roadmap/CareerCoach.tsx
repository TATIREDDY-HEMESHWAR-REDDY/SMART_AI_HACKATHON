import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { roadmapService } from '@/services/roadmapService';
import type { CoachResponse } from '@/services/roadmapService';
import { Bot, User, Send, ChevronLeft, Sparkles, Loader2, Target, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
  response?: CoachResponse;
}

const SUGGESTED_QUESTIONS = [
  "What should I work on next?",
  "Why is my readiness score low?",
  "What skills am I missing for backend roles?",
  "How should I prepare for interviews?"
];

export default function CareerCoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: roadmapService.chatWithCoach,
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'coach',
          content: data.answer,
          response: data
        }
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'coach',
          content: "Your career data is still available, but the AI Coach is temporarily unavailable. Please try again later.",
        }
      ]);
    }
  });

  const handleSend = (text: string = input) => {
    if (!text.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    chatMutation.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-t-2xl p-4 shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <Link to="/career/roadmap" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">AI Career Coach</h1>
              <p className="text-sm text-gray-500 font-medium">Ask me anything about your career path</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 border-x border-gray-200 overflow-y-auto p-6 space-y-6">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 mb-8">
              I analyze your Profile, Readiness, Job Matches, and Interviews to give you personalized, data-backed guidance.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all rounded-xl p-4 text-left text-sm font-medium text-gray-700 hover:text-indigo-700"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                msg.role === 'user' ? 'bg-blue-600 ml-3' : 'bg-indigo-600 mr-3'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>

              <div className={`rounded-2xl p-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                
                {/* Structured AI Response Render */}
                {msg.role === 'coach' && msg.response && msg.response.confidence > 0 && (
                  <div className="mt-6 space-y-5">
                    
                    {msg.response.key_points && msg.response.key_points.length > 0 && (
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-1.5 text-indigo-600" /> Key Insights
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-indigo-800">
                          {msg.response.key_points.map((kp, i) => (
                            <li key={i}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {msg.response.recommended_actions && msg.response.recommended_actions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">Recommended Actions</h4>
                          <div className="space-y-2">
                            {msg.response.recommended_actions.map((action, i) => (
                              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 font-medium flex items-center shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" /> {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {msg.response.referenced_gaps && msg.response.referenced_gaps.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">Identified Gaps</h4>
                          <div className="flex flex-wrap gap-2">
                            {msg.response.referenced_gaps.map((gap, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" /> {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
              
            </div>
          </div>
        ))}
        
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 mr-3 flex items-center justify-center mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-5 shadow-sm flex items-center space-x-3 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Analyzing your career profile...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-b-2xl p-4 shadow-sm z-10">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your career coach..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[56px] min-h-[56px] overflow-hidden"
            disabled={chatMutation.isPending}
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || chatMutation.isPending}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
          AI Career Coach grounds its advice in your actual platform data. Responses are generated based on your profile context.
        </p>
      </div>

    </div>
  );
}
