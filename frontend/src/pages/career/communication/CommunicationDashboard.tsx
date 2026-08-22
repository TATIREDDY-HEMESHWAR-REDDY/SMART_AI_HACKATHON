import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import { AssessmentCard } from '@/components/career/assessments/AssessmentCard';
import { MessageSquare } from 'lucide-react';

export default function CommunicationDashboard() {
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', 'COMMUNICATION'],
    queryFn: () => assessmentService.getAssessments('COMMUNICATION'),
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
          Communication Assessments
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Enhance your professional communication, grammar, and verbal abilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments?.map((assessment: any) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
        {assessments?.length === 0 && (
          <div className="col-span-full text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No communication assessments available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
