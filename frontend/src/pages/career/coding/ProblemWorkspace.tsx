import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { codingService } from '@/services/codingService';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Play, Send, CheckCircle2, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProblemWorkspace() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [result, setResult] = useState<any>(null);
  
  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => codingService.getProblem(slug!),
    enabled: !!slug
  });

  const runMutation = useMutation({
    mutationFn: (data: { language: string, source_code: string }) => codingService.runCode(slug!, data.language, data.source_code),
    onSuccess: (data) => setResult({ type: 'run', data })
  });

  const submitMutation = useMutation({
    mutationFn: (data: { language: string, source_code: string }) => codingService.submitCode(slug!, data.language, data.source_code),
    onSuccess: (data) => setResult({ type: 'submit', data })
  });

  useEffect(() => {
    if (problem && problem.starter_code) {
      setCode(problem.starter_code[language] || '');
    }
  }, [problem, language]);

  if (isLoading || !problem) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const handleRun = () => {
    if (!code) return;
    setResult(null);
    runMutation.mutate({ language, source_code: code });
  };

  const handleSubmit = () => {
    if (!code) return;
    setResult(null);
    submitMutation.mutate({ language, source_code: code });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/career/coding')} className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-gray-900">{problem.title}</h1>
          <Badge variant={problem.difficulty === 'EASY' ? 'success' : problem.difficulty === 'MEDIUM' ? 'warning' : 'destructive'} className="text-xs">
            {problem.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRun}
            disabled={runMutation.isPending || submitMutation.isPending}
            className="flex items-center px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {runMutation.isPending ? <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/> : <Play className="w-4 h-4 mr-2" />}
            Run
          </button>
          <button 
            onClick={handleSubmit}
            disabled={runMutation.isPending || submitMutation.isPending}
            className="flex items-center px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {submitMutation.isPending ? <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Send className="w-4 h-4 mr-2" />}
            Submit
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Description */}
        <div className="w-1/2 border-r bg-white flex flex-col overflow-hidden">
          <div className="flex border-b">
            <button 
              className={cn("px-4 py-3 text-sm font-medium border-b-2", activeTab === 'description' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900")}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={cn("px-4 py-3 text-sm font-medium border-b-2", activeTab === 'submissions' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900")}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' && (
              <div className="space-y-8">
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                  {problem.description}
                </div>
                
                {problem.sample_test_cases && problem.sample_test_cases.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Examples</h3>
                    {problem.sample_test_cases.map((tc: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 font-mono text-sm border border-gray-100">
                        <div className="mb-2"><span className="text-gray-500 font-semibold">Input:</span> <span className="text-gray-800">{tc.input_data}</span></div>
                        <div className="mb-2"><span className="text-gray-500 font-semibold">Output:</span> <span className="text-gray-800">{tc.expected_output}</span></div>
                        {tc.explanation && (<div><span className="text-gray-500 font-semibold">Explanation:</span> <span className="text-gray-600 font-sans">{tc.explanation}</span></div>)}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Constraints</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 font-mono">
                      {problem.constraints.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'submissions' && (
              <div className="text-sm text-gray-500 text-center mt-10">
                Submission history will appear here.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code & Console */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Editor Header */}
          <div className="h-10 bg-[#2d2d2d] flex items-center px-4 shrink-0 justify-between">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-gray-300 text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Console / Results Panel */}
          {result && (
            <div className="h-1/3 bg-white border-t flex flex-col shrink-0 z-10 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                <span className="font-semibold text-sm text-gray-700 flex items-center">
                  {result.type === 'run' ? 'Test Results' : 'Submission Result'}
                </span>
                <button onClick={() => setResult(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center mb-4">
                  {result.data.status === 'ACCEPTED' ? (
                    <span className="flex items-center text-green-600 font-bold text-lg"><CheckCircle2 className="w-6 h-6 mr-2" /> Accepted</span>
                  ) : result.data.status === 'WRONG_ANSWER' ? (
                    <span className="flex items-center text-red-600 font-bold text-lg"><AlertCircle className="w-6 h-6 mr-2" /> Wrong Answer</span>
                  ) : (
                    <span className="flex items-center text-amber-600 font-bold text-lg"><AlertCircle className="w-6 h-6 mr-2" /> {result.data.status}</span>
                  )}
                  
                  <span className="ml-4 text-sm text-gray-500 font-medium">
                    Passed {result.data.test_cases_passed} / {result.data.total_test_cases} Testcases
                  </span>
                </div>
                
                {result.type === 'submit' && result.data.ai_feedback && (
                  <div className="mb-4 bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start">
                    <Lightbulb className="w-5 h-5 text-purple-600 mr-3 shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900 leading-relaxed font-medium">
                      {result.data.ai_feedback}
                    </p>
                  </div>
                )}
                
                {result.type === 'run' && result.data.results && (
                  <div className="space-y-4">
                    {result.data.results.map((tc: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded border p-3">
                        <div className="font-medium text-sm mb-2 text-gray-700">Case {idx + 1}</div>
                        <div className="grid gap-2 text-xs font-mono">
                          <div><span className="text-gray-500">Input:</span> {tc.input_data}</div>
                          <div><span className="text-gray-500">Expected:</span> {tc.expected_output}</div>
                          <div>
                            <span className="text-gray-500">Output:</span> 
                            <span className={tc.status === 'ACCEPTED' ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>{tc.actual_output}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
