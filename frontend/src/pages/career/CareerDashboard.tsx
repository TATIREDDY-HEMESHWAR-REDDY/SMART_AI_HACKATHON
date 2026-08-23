import { useQuery } from '@tanstack/react-query';
import { careerService } from '@/services/careerService';
import { useStudent } from '@/contexts/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Lightbulb, Code2, BrainCircuit, Users, Target, FileText, Briefcase } from 'lucide-react';

export default function CareerDashboard() {
  const { student } = useStudent();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['careerDashboard'],
    queryFn: careerService.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ERP profile takes precedence for skills and identity data.
  // Readiness scores still come from Career OS API (those are their own assessment results).
  const erpProfile = student?.erpProfile;

  const { readiness, profile, ai_insight, top_skills: apiSkills } = dashboard ?? {};

  // Use ERP skills when available; fall back to Career OS API skills.
  const top_skills = erpProfile?.skills?.length
    ? erpProfile.skills.map(s => ({ id: s.id, name: s.name, category: s.level, level: s.level, score: s.score }))
    : apiSkills;

  // Profile completion: use ERP fields to derive a real number.
  const erpCompletion = erpProfile
    ? Math.round(
        ([erpProfile.targetRole, erpProfile.github, erpProfile.linkedin].filter(Boolean).length / 3) * 100
      )
    : null;

  const componentIcons: Record<string, any> = {
    Coding: Code2,
    Aptitude: BrainCircuit,
    Technical: Target,
    Communication: Users,
    Interview: Users,
    Resume: FileText,
    Projects: Briefcase,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Good evening, {student?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Here's your career readiness overview and recommended next steps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <Card className="lg:col-span-1 bg-gradient-to-b from-white to-gray-50 border-gray-200">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
            <ScoreRing score={readiness?.overall_score ?? null} size={160} strokeWidth={12} />
            <div className="mt-6 text-center">
              <h3 className="font-semibold text-lg text-gray-800">Overall Readiness</h3>
              {readiness?.overall_score !== null ? (
                <p className="text-sm text-gray-500 mt-1">Based on {readiness?.components?.filter((c: any) => c.status === 'ASSESSED').length || 0} assessed modules.</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Complete assessments to unlock your score.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight Card */}
        <Card className="lg:col-span-2 border-blue-100 shadow-blue-50/50 shadow-lg">
          <CardHeader className="bg-blue-50/50 border-blue-100 flex flex-row items-center space-x-3 pb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-700" />
            </div>
            <CardTitle className="text-blue-900">AI Career Coach Insight</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {ai_insight ? (
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  "{ai_insight.content}"
                </p>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Recommended Actions</h4>
                  <ul className="space-y-3">
                    {ai_insight.recommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No insights available right now.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Readiness Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {readiness?.components?.map((comp: any) => {
                const Icon = componentIcons[comp.name] || Target;
                const isAssessed = comp.status === 'ASSESSED';
                return (
                  <div key={comp.name} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-medium text-gray-900">{comp.name}</span>
                        {isAssessed ? (
                          <span className="font-semibold text-gray-700">{Math.round(comp.score)}%</span>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 font-normal">Not Assessed</Badge>
                        )}
                      </div>
                      <ProgressBar 
                        progress={isAssessed ? comp.score : 0} 
                        colorClass={isAssessed ? "bg-blue-600" : "bg-gray-200"} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {erpCompletion ?? profile?.completion_stats?.completion_percentage ?? 0}%
                </span>
              </div>
              <ProgressBar progress={erpCompletion ?? profile?.completion_stats?.completion_percentage ?? 0} colorClass="bg-green-500" />

              {erpProfile && (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Missing Information</h4>
                  <div className="flex flex-wrap gap-2">
                    {!erpProfile.github && <Badge variant="warning">GitHub</Badge>}
                    {!erpProfile.linkedin && <Badge variant="warning">LinkedIn</Badge>}
                    {!erpProfile.targetRole && <Badge variant="warning">Target Role</Badge>}
                  </div>
                </div>
              )}

              {!erpProfile && profile?.completion_stats?.missing_sections?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Missing Information</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.completion_stats.missing_sections.map((sec: string) => (
                      <Badge key={sec} variant="warning" className="capitalize">{sec.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Top Verified Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {top_skills?.length > 0 ? (
                <div className="space-y-4">
                  {top_skills.map((skill: any) => (
                    <div key={skill.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{skill.name}</p>
                        <p className="text-xs text-gray-500">{skill.category} • {skill.level}</p>
                      </div>
                      <Badge variant="success">{skill.score ? `${Math.round(skill.score)} pts` : 'Verified'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Complete assessments to verify your skills.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
