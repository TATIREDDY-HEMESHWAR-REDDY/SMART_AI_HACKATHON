import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, HelpCircle, Trophy, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';

interface AssessmentCardProps {
  assessment: {
    id: number;
    title: string;
    difficulty: string;
    topic: string;
    total_questions: number;
    duration_minutes: number;
    passing_score: number;
  };
}

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => assessmentService.deleteAssessment(assessment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    }
  });

  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b border-gray-100">
        
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Badge variant={assessment.difficulty === 'EASY' ? 'success' : assessment.difficulty === 'MEDIUM' ? 'warning' : 'destructive'}>
              {assessment.difficulty}
            </Badge>
            {assessment.topic && <Badge variant="outline">{assessment.topic}</Badge>}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }} 
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Delete Quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardTitle className="mt-3 text-xl">{assessment.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-5">
        <div className="flex space-x-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-1 text-gray-400" />
            {assessment.total_questions} Qs
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-gray-400" />
            {assessment.duration_minutes} Mins
          </div>
          <div className="flex items-center">
            <Trophy className="w-4 h-4 mr-1 text-gray-400" />
            Pass: {assessment.passing_score}%
          </div>
        </div>
        
        <button 
          onClick={() => navigate(`/career/assessments/${assessment.id}`)}
          className="w-full py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          View Assessment
        </button>
      </CardContent>
    </Card>
  );
}
