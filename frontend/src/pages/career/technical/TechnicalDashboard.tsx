import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import { AssessmentCard } from '@/components/career/assessments/AssessmentCard';
import { GenerateQuizSection } from '@/components/career/assessments/GenerateQuizSection';
import { Code2 } from 'lucide-react';

export default function TechnicalDashboard() {
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', 'TECHNICAL'],
    queryFn: () => assessmentService.getAssessments('TECHNICAL'),
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <Code2 className="w-8 h-8 mr-3 text-blue-600" />
          Technical Assessments
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Evaluate your core computer science knowledge and software engineering principles.
        </p>
      </div>

      <GenerateQuizSection category="TECHNICAL" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments?.map((assessment: any) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
        {assessments?.length === 0 && (
          <div className="col-span-full text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No technical assessments available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
