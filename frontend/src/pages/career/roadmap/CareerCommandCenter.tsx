
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { roadmapService } from '@/services/roadmapService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Target, Flag, Rocket, CheckCircle2, AlertCircle, Bot, Code2, FileText, Briefcase, ChevronRight, Activity, Map, ArrowRight } from 'lucide-react';
import { ScoreRing } from '@/components/ui/ScoreRing';

export default function CareerCommandCenter() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: roadmap, isLoading, error } = useQuery({
    queryKey: ['roadmap'],
    queryFn: roadmapService.getRoadmap
  });

  const generateMutation = useMutation({
    mutationFn: roadmapService.generateRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => roadmapService.updateTaskStatus(taskId, 'COMPLETED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Could not load Career Command Center</h2>
        <p className="text-gray-500 mb-6">There was a problem loading your personalized roadmap.</p>
      </div>
    );
  }

  const pendingTasks = roadmap.tasks.filter(t => t.status === 'PENDING');
  const highPriority = pendingTasks.filter(t => t.priority === 'HIGH');
  const mediumPriority = pendingTasks.filter(t => t.priority === 'MEDIUM');
  const lowPriority = pendingTasks.filter(t => t.priority === 'LOW');
  
  // Create an ordered display list
  const nextActions = [...highPriority, ...mediumPriority, ...lowPriority].slice(0, 3);
  
  // Categorize for 30 day timeline (mock groupings based on array order for now since we don't have explicit dates)
  const timelineTasks = [...pendingTasks];

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'CODING': return <Code2 className="w-5 h-5 text-blue-500" />;
      case 'RESUME': return <FileText className="w-5 h-5 text-indigo-500" />;
      case 'JOBS': return <Briefcase className="w-5 h-5 text-teal-500" />;
      case 'INTERVIEW': return <Bot className="w-5 h-5 text-amber-500" />;
      default: return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
    if (priority === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const mapCategoryToRoute = (category: string) => {
    const map: Record<string, string> = {
      'CODING': '/career/coding',
      'APTITUDE': '/career/aptitude',
      'TECHNICAL': '/career/technical',
      'COMMUNICATION': '/career/communication',
      'INTERVIEW': '/career/interview',
      'RESUME': '/career/resume',
      'JOBS': '/career/jobs',
      'PROJECTS': '/career/profile'
    };
    return map[category] || '/career';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center space-x-2 mb-3">
            <Rocket className="w-6 h-6 text-blue-300" />
            <h1 className="text-3xl font-bold">Your Career Command Center</h1>
          </div>
          {roadmap.goal ? (
            <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
              Your personalized path to becoming a <span className="font-semibold text-white">{roadmap.goal.target_role || roadmap.goal.title}</span>.
            </p>
          ) : (
            <p className="text-blue-100 text-lg max-w-xl">
              Define your career goal and let AI build your personalized placement roadmap.
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          {roadmap.goal ? (
             <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm text-center min-w-[200px]">
               <div className="text-sm text-blue-200 font-medium uppercase tracking-wider mb-1">Target Date</div>
               <div className="text-2xl font-bold text-white">
                 {roadmap.goal.target_date ? new Date(roadmap.goal.target_date).toLocaleDateString() : 'TBD'}
               </div>
             </div>
          ) : (
            <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-50 transition-colors">
              Set Career Goal
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* READINESS HERO */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" /> Career Readiness
              </h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {roadmap.readiness?.overall_score !== undefined ? 'Assessed' : 'Not Fully Assessed'}
              </Badge>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center">
                <ScoreRing score={roadmap.readiness?.overall_score || 0} size={120} strokeWidth={10} />
                <span className="mt-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Overall</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 w-full">
                {[
                  { label: 'Coding', score: roadmap.readiness?.coding_score },
                  { label: 'Aptitude', score: roadmap.readiness?.aptitude_score },
                  { label: 'Technical', score: roadmap.readiness?.technical_score },
                  { label: 'Communication', score: roadmap.readiness?.communication_score },
                  { label: 'Interview', score: roadmap.readiness?.interview_score },
                  { label: 'Resume', score: roadmap.readiness?.resume_score },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col items-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{item.label}</span>
                    {item.score !== undefined && item.score !== null ? (
                      <span className={`text-xl font-bold ${item.score >= 70 ? 'text-green-600' : item.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {Math.round(item.score)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium bg-gray-200 px-2 py-1 rounded">PENDING</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* NEXT 3 ACTIONS */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Flag className="w-5 h-5 mr-2 text-blue-600" /> Next Actions
              </h2>
              {roadmap.tasks.length === 0 ? (
                <button 
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate My Roadmap'}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-500">{pendingTasks.length} tasks remaining</span>
              )}
            </div>

            {roadmap.tasks.length === 0 && !generateMutation.isPending ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Let's build your career plan.</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  The system will analyze your Profile, Readiness, Resumes, and Job Matches to generate a targeted action plan.
                </p>
                <button 
                  onClick={() => generateMutation.mutate()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition-colors"
                >
                  Generate My Roadmap
                </button>
              </div>
            ) : nextActions.length > 0 ? (
              <div className="space-y-4">
                {nextActions.map((task) => (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                          {getCategoryIcon(task.category)}
                        </div>
                        <div>
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider mb-1 font-bold ${getPriorityColor(task.priority)}`}>
                            {task.priority} PRIORITY
                          </Badge>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{task.title}</h3>
                        </div>
                      </div>
                      <button 
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        disabled={completeTaskMutation.isPending}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 ml-12 whitespace-pre-wrap">{task.description}</p>
                    
                    <div className="ml-12 mt-4 flex items-center">
                      <button 
                        onClick={() => navigate(mapCategoryToRoute(task.category))}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Take Action <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">You're all caught up!</h3>
                <p className="mt-1">You've completed all high-priority tasks on your roadmap.</p>
              </div>
            )}
          </Card>

        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-8">
          
          {/* AI COACH MINI-PANEL */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-indigo-900 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-indigo-600" /> AI Career Coach
              </h2>
            </div>
            <p className="text-sm text-indigo-800 mb-6 leading-relaxed">
              Stuck on what to do next? Have an interview coming up? Ask your context-aware coach.
            </p>
            <Link to="/career/coach" className="block w-full">
              <button className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center">
                Chat with Coach <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </Card>

          {/* ROADMAP PROGRESS */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" /> Roadmap Progress
            </h3>
            
            <div className="mb-2 flex justify-between items-end">
              <span className="text-3xl font-bold text-gray-900">{roadmap.progress_percentage}%</span>
              <span className="text-sm font-medium text-gray-500 mb-1">{roadmap.completed_tasks} / {roadmap.tasks.length + roadmap.completed_tasks} tasks</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${roadmap.progress_percentage}%` }}></div>
            </div>

            {/* CAREER GAPS LIST (If provided by backend or extracted from tasks) */}
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 pb-2 border-b border-gray-100">Top Focus Areas</h4>
            <ul className="space-y-3">
               {/* Extract unique categories from tasks as "gaps" if backend gap list is empty */}
               {Array.from(new Set(pendingTasks.map(t => t.category))).slice(0, 4).map(cat => (
                 <li key={cat} className="flex justify-between items-center text-sm">
                   <span className="flex items-center text-gray-700 font-medium">
                     <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                     {cat}
                   </span>
                   <button onClick={() => navigate(mapCategoryToRoute(cat))} className="text-blue-600 hover:underline text-xs font-semibold">Improve</button>
                 </li>
               ))}
               {pendingTasks.length === 0 && (
                 <li className="text-sm text-gray-500 italic">No current focus areas identified.</li>
               )}
            </ul>
          </Card>

          {/* 30-DAY TIMELINE */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Action Timeline</h3>
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
              {timelineTasks.slice(0, 5).map((task, idx) => (
                <div key={task.id} className="relative pl-6">
                  <div className={`absolute -left-2 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ${idx === 0 ? 'bg-blue-500 ring-blue-100' : 'bg-gray-300 ring-transparent'}`}></div>
                  <h4 className={`text-sm font-bold ${idx === 0 ? 'text-gray-900' : 'text-gray-600'} leading-tight mb-1`}>{task.title}</h4>
                  <div className="flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {task.category}
                  </div>
                </div>
              ))}
              {timelineTasks.length > 5 && (
                <div className="relative pl-6">
                   <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-gray-200 border-2 border-white"></div>
                   <p className="text-xs font-medium text-gray-500">+{timelineTasks.length - 5} more tasks</p>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
