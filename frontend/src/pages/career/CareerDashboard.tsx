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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  const assessedCount = readiness?.components?.filter((c: any) => c.status === 'ASSESSED').length || 0;
  const strongest = [...(readiness?.components ?? [])]
    .filter((c: any) => c.status === 'ASSESSED')
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 2);
  const weakest = [...(readiness?.components ?? [])]
    .filter((c: any) => c.status !== 'ASSESSED' || c.score < 60)
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Good evening, {student?.name?.split(' ')[0]}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Career readiness overview and recommended next steps.
        </p>
      </div>

      {/* Readiness + target role, data-first */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[220px]">
            <ScoreRing score={readiness?.overall_score ?? null} size={132} strokeWidth={9} />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {readiness?.overall_score !== null
                ? `Based on ${assessedCount} assessed modules`
                : 'Complete assessments to unlock your score'}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6 grid grid-cols-2 gap-8 h-full">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Strongest areas</p>
              {strongest.length > 0 ? (
                <ul className="space-y-2">
                  {strongest.map((c: any) => (
                    <li key={c.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">{Math.round(c.score)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough data yet</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Needs attention</p>
              {weakest.length > 0 ? (
                <ul className="space-y-2">
                  {weakest.map((c: any) => (
                    <li key={c.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-amber-700">{c.status === 'ASSESSED' ? `${Math.round(c.score)}%` : 'Not started'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing flagged</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI coach insight — plain, structured, embedded */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2.5">
          <Lightbulb className="w-4 h-4 text-primary" />
          <CardTitle>Career coach note</CardTitle>
        </CardHeader>
        <CardContent>
          {ai_insight ? (
            <div className="space-y-4">
              <p className="text-foreground/80 text-[15px] leading-relaxed">
                {ai_insight.content}
              </p>
              {ai_insight.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Next actions</p>
                  <ul className="space-y-2">
                    {ai_insight.recommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="flex-shrink-0 h-5 w-5 rounded bg-accent text-accent-foreground flex items-center justify-center text-[11px] font-semibold mr-2.5 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-foreground/80">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No insights available right now.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Readiness breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {readiness?.components?.map((comp: any) => {
                const Icon = componentIcons[comp.name] || Target;
                const isAssessed = comp.status === 'ASSESSED';
                return (
                  <div key={comp.name} className="px-6 py-3.5 flex items-center hover:bg-secondary/50 transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground mr-3.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-foreground">{comp.name}</span>
                        {isAssessed ? (
                          <span className="text-sm text-foreground/70 tabular-nums">{Math.round(comp.score)}%</span>
                        ) : (
                          <Badge variant="outline" className="font-normal">Not assessed</Badge>
                        )}
                      </div>
                      <ProgressBar
                        progress={isAssessed ? comp.score : 0}
                        colorClass={isAssessed ? "bg-primary" : "bg-secondary"}
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
              <CardTitle>Profile completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="font-serif text-2xl font-semibold text-foreground">
                  {erpCompletion ?? profile?.completion_stats?.completion_percentage ?? 0}%
                </span>
              </div>
              <ProgressBar progress={erpCompletion ?? profile?.completion_stats?.completion_percentage ?? 0} colorClass="bg-primary" />

              {erpProfile && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Missing information</p>
                  <div className="flex flex-wrap gap-2">
                    {!erpProfile.github && <Badge variant="warning">GitHub</Badge>}
                    {!erpProfile.linkedin && <Badge variant="warning">LinkedIn</Badge>}
                    {!erpProfile.targetRole && <Badge variant="warning">Target role</Badge>}
                  </div>
                </div>
              )}

              {!erpProfile && profile?.completion_stats?.missing_sections?.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Missing information</p>
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
              <CardTitle>Top verified skills</CardTitle>
            </CardHeader>
            <CardContent>
              {top_skills?.length > 0 ? (
                <div className="space-y-3.5">
                  {top_skills.map((skill: any) => (
                    <div key={skill.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-foreground">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{skill.category} · {skill.level}</p>
                      </div>
                      <Badge variant="success">{skill.score ? `${Math.round(skill.score)} pts` : 'Verified'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Complete assessments to verify your skills.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
