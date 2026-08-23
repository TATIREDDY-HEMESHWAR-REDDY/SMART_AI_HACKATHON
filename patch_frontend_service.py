with open("frontend/src/services/assessmentService.ts", "r") as f:
    content = f.read()

new_methods = """
  generateAssessment: async (prompt: string, category: string) => {
    const { data } = await api.post('/career/assessments/generate', { prompt, category });
    return data;
  },
  
  deleteAssessment: async (id: number) => {
    const { data } = await api.delete(`/career/assessments/${id}`);
    return data;
  },
};
"""

content = content.replace("};", new_methods)

with open("frontend/src/services/assessmentService.ts", "w") as f:
    f.write(content)
