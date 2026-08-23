import type { ResumeData } from '@/services/resumeService';
import { Mail, Phone, MapPin, Link as Linkedin, Link as Github, Globe } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  // Common sections logic, we can adjust classes based on template later
  // We'll support 'modern', 'minimal', 'technical' via CSS classes
  
  const tpl = resume.template || 'modern';
  
  return (
    <div className={`resume-preview template-${tpl} p-10 print:p-8 text-slate-800 bg-white font-sans text-[11pt] leading-[1.4]`}>
      
      {/* Header */}
      <header className={`mb-6 ${tpl === 'modern' ? 'border-b-2 border-slate-800 pb-4' : 'mb-8'}`}>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-wide">
          {resume.full_name || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {resume.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{resume.email}</span>
            </div>
          )}
          {resume.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{resume.phone}</span>
            </div>
          )}
          {resume.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{resume.location}</span>
            </div>
          )}
          {resume.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5" />
              <span>{resume.linkedin}</span>
            </div>
          )}
          {resume.github && (
            <div className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5" />
              <span>{resume.github}</span>
            </div>
          )}
          {resume.portfolio && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>{resume.portfolio}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-6">
          <SectionHeading title="Professional Summary" template={tpl} />
          <p className="text-sm mt-2 text-justify">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section className="mb-6">
          <SectionHeading title="Experience" template={tpl} />
          <div className="mt-3 flex flex-col gap-4">
            {resume.experiences.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline font-semibold text-slate-800">
                  <div className="text-[11.5pt]">{exp.role}</div>
                  <div className="text-[10pt] font-normal text-slate-600 whitespace-nowrap">
                    {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                  </div>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="text-[10.5pt] font-medium text-slate-700">{exp.company}</div>
                  <div className="text-[10pt] text-slate-500 italic">{exp.location}</div>
                </div>
                {exp.description && <p className="text-sm mb-1">{exp.description}</p>}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-sm space-y-0.5">
                    {exp.achievements.map((ach: string, j: number) => (
                      <li key={j} className="pl-1 text-slate-700">{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="mb-6">
          <SectionHeading title="Projects" template={tpl} />
          <div className="mt-3 flex flex-col gap-4">
            {resume.projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline font-semibold text-slate-800 mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11.5pt]">{proj.name}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[9pt] font-normal text-slate-500 font-mono">
                        | {proj.technologies.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="text-[10pt] font-normal text-slate-600 whitespace-nowrap">
                    {proj.start_date && `${proj.start_date} ${proj.end_date ? `– ${proj.end_date}` : ''}`}
                  </div>
                </div>
                {proj.description && <p className="text-sm mb-1">{proj.description}</p>}
                {proj.achievements && proj.achievements.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-sm space-y-0.5">
                    {proj.achievements.map((ach: string, j: number) => (
                      <li key={j} className="pl-1 text-slate-700">{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.educations && resume.educations.length > 0 && (
        <section className="mb-6">
          <SectionHeading title="Education" template={tpl} />
          <div className="mt-3 flex flex-col gap-3">
            {resume.educations.map((edu: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline font-semibold text-slate-800 mb-0.5">
                  <div className="text-[11.5pt]">{edu.institution}</div>
                  <div className="text-[10pt] font-normal text-slate-600 whitespace-nowrap">
                    {edu.start_date} – {edu.end_date}
                  </div>
                </div>
                <div className="flex justify-between items-baseline">
                  <div className="text-[10.5pt] text-slate-700">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </div>
                  {edu.gpa && <div className="text-[10pt] font-medium text-slate-600">GPA: {edu.gpa}</div>}
                </div>
                {edu.description && <p className="text-sm mt-1 text-slate-600">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <section className="mb-6">
          <SectionHeading title="Skills" template={tpl} />
          <div className="mt-3 text-sm">
            {/* Group by category if available */}
            {Object.entries(
              resume.skills.reduce((acc: any, skill: any) => {
                const cat = skill.category || 'Core Competencies';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(skill.name);
                return acc;
              }, {})
            ).map(([category, skills]: any, i: number) => (
              <div key={i} className="mb-1.5 flex">
                <span className="font-semibold text-slate-800 w-40 shrink-0">{category}:</span>
                <span className="text-slate-700">{skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function SectionHeading({ title, template }: { title: string, template: string }) {
  if (template === 'minimal') {
    return <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-widest">{title}</h2>;
  }
  if (template === 'technical') {
    return (
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 uppercase shrink-0">{title}</h2>
        <div className="h-px bg-slate-800 flex-1 opacity-20"></div>
      </div>
    );
  }
  // Modern
  return (
    <h2 className="text-[13pt] font-bold text-slate-800 uppercase border-b border-slate-300 pb-1 tracking-wider">
      {title}
    </h2>
  );
}
