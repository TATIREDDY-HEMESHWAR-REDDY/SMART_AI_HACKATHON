with open("frontend/src/pages/career/aptitude/AssessmentReview.tsx", "r") as f:
    content = f.read()

content = content.replace("queryFn: () => assessmentService.getResult(Number(id)),", "queryFn: () => assessmentService.getAttempt(Number(id)),")

with open("frontend/src/pages/career/aptitude/AssessmentReview.tsx", "w") as f:
    f.write(content)
