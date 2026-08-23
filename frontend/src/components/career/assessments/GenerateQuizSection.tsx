import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessmentService';
import { Sparkles, Loader2 } from 'lucide-react';

export function GenerateQuizSection({ category }: { category: string }) {
  const [prompt, setPrompt] = useState('');
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: () => assessmentService.generateAssessment(prompt, category),
    onSuccess: () => {
      setPrompt('');
      queryClient.invalidateQueries({ queryKey: ['assessments', category] });
    }
  });

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-4">
      <div className="flex-1 w-full">
        <label className="block text-sm font-semibold text-blue-900 mb-2">
          Generate AI Custom Quiz
        </label>
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Infosys PYQs, React hooks, Data Structures..."
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && prompt.trim() && !generateMutation.isPending) {
              generateMutation.mutate();
            }
          }}
        />
      </div>
      <div className="flex-shrink-0 mt-6 md:mt-0 w-full md:w-auto">
        <button
          onClick={() => generateMutation.mutate()}
          disabled={!prompt.trim() || generateMutation.isPending}
          className="w-full flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          Generate Quiz
        </button>
      </div>
    </div>
  );
}
