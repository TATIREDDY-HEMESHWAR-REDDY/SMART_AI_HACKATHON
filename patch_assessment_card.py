import re

with open("frontend/src/components/career/assessments/AssessmentCard.tsx", "r") as f:
    content = f.read()

# Add imports for delete
content = content.replace(
    "import { Clock, HelpCircle, Trophy } from 'lucide-react';", 
    "import { Clock, HelpCircle, Trophy, X } from 'lucide-react';\nimport { useMutation, useQueryClient } from '@tanstack/react-query';\nimport { assessmentService } from '@/services/assessmentService';"
)

# Add delete functionality inside AssessmentCard
delete_mutation = """
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => assessmentService.deleteAssessment(assessment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    }
  });
"""
content = content.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n" + delete_mutation)

# Add X button
x_btn = """
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
"""

content = re.sub(
    r'<div className="flex justify-between items-start">.*?</div>',
    x_btn,
    content,
    flags=re.DOTALL,
    count=1
)

with open("frontend/src/components/career/assessments/AssessmentCard.tsx", "w") as f:
    f.write(content)
