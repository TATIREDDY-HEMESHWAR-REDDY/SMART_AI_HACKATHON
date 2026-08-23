import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerService } from '@/services/careerService';
import {
  User, Briefcase, Globe, GitBranch, Link, Target, Star,
  Award, Code2, BookOpen, ChevronRight, Edit3, Save, X,
  CheckCircle2, Plus, Trash2, Zap, TrendingUp
} from 'lucide-react';

const DOMAIN_OPTIONS = ['Full Stack Development', 'Data Science', 'AI/ML', 'Cloud Engineering', 'DevOps', 'Mobile Development', 'Cybersecurity', 'Embedded Systems', 'Product Management'];

export default function CareerProfile() {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['careerProfile'],
    queryFn: careerService.getProfile,
  });

  const { data: skills } = useQuery({
    queryKey: ['careerSkills'],
    queryFn: careerService.getSkills,
  });

  const updateMutation = useMutation({
    mutationFn: careerService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerProfile'] });
      setEditMode(false);
    },
  });

  const handleEdit = () => {
    setFormData({
      target_role: profile?.target_role || '',
      target_domain: profile?.target_domain || '',
      career_objective: profile?.career_objective || '',
      github_url: profile?.github_url || '',
      linkedin_url: profile?.linkedin_url || '',
      portfolio_url: profile?.portfolio_url || '',
    });
    setEditMode(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initials = (profile?.target_role || 'Student').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const completionPct = profile?.completion_stats?.completion_percentage || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl">
        {/* decorative blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30 shadow-lg">
              {initials}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-green-400/20 text-green-300 text-xs font-medium border border-green-400/30">
                ● Active
              </span>
              <span className="text-white/60 text-xs">STU10045</span>
            </div>
            <h1 className="text-3xl font-bold">Alex Chen</h1>
            <p className="text-blue-200 text-lg mt-1">{profile?.target_role || 'Software Engineer'}</p>
            <p className="text-white/70 text-sm mt-1">{profile?.target_domain || 'Full Stack Development'}</p>

            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors">
                  <GitBranch className="w-4 h-4" /> GitHub
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors">
                  <Link className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {profile?.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors">
                  <Globe className="w-4 h-4" /> Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Profile Completion Ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - completionPct / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{completionPct}%</span>
              </div>
            </div>
            <span className="text-white/70 text-xs">Profile Complete</span>
          </div>

          {/* Edit Button */}
          {!editMode && (
            <button
              onClick={handleEdit}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-medium backdrop-blur-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── EDIT FORM ── */}
      {editMode && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Edit Profile
            </h3>
            <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Role</label>
                <input
                  type="text"
                  value={formData.target_role}
                  onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Domain</label>
                <select
                  value={formData.target_domain}
                  onChange={e => setFormData({ ...formData, target_domain: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  {DOMAIN_OPTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Career Objective</label>
              <textarea
                value={formData.career_objective}
                onChange={e => setFormData({ ...formData, career_objective: e.target.value })}
                rows={3}
                placeholder="Describe your career goals..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'GitHub URL', key: 'github_url', icon: GitBranch, placeholder: 'https://github.com/...' },
                { label: 'LinkedIn URL', key: 'linkedin_url', icon: Link, placeholder: 'https://linkedin.com/in/...' },
                { label: 'Portfolio URL', key: 'portfolio_url', icon: Globe, placeholder: 'https://yoursite.com' },
              ].map(({ label, key, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-gray-500" /> {label}
                  </label>
                  <input
                    type="url"
                    value={formData[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-all shadow-sm">
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Target Role', value: profile?.target_role || '—', icon: Briefcase, color: 'blue' },
          { label: 'Domain', value: profile?.target_domain || '—', icon: Target, color: 'indigo' },
          { label: 'Skills', value: `${skills?.length || 0} added`, icon: Zap, color: 'purple' },
          { label: 'Profile Score', value: `${completionPct}%`, icon: TrendingUp, color: 'green' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* ── CAREER OBJECTIVE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-500" /> Career Objective
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          {profile?.career_objective || 'No objective set yet. Click Edit Profile to add your career objective.'}
        </p>
      </div>

      {/* ── SKILLS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-purple-500" /> Skills
        </h3>
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 text-sm font-medium hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                {skill.name}
                {skill.level && <span className="text-blue-400 text-xs">· {skill.level}</span>}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 text-sm py-4">
            <Code2 className="w-8 h-8 text-gray-200" />
            <div>
              <p className="text-gray-500">No skills added yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Visit your dashboard to update your skill set</p>
            </div>
          </div>
        )}
      </div>

      {/* ── MISSING SECTIONS ── */}
      {profile?.completion_stats?.missing_sections?.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
          <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" /> Complete your profile to stand out
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {profile.completion_stats.missing_sections.map((section: string) => (
              <div key={section} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm text-amber-700 border border-amber-100 shadow-sm">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span className="capitalize">{section.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {profile?.projects?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-green-500" /> Projects
          </h3>
          <div className="space-y-3">
            {profile.projects.map((project: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
                  {project.description && <p className="text-xs text-gray-500 mt-0.5">{project.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
