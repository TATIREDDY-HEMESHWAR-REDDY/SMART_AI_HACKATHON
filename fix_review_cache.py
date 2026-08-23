with open("frontend/src/pages/career/aptitude/AssessmentReview.tsx", "r") as f:
    content = f.read()

content = content.replace("queryKey: ['attemptResult', id]", "queryKey: ['attemptDetails', id]")
content = content.replace("const answersMap = attempt.answers.reduce", "const answersMap = (attempt.answers || []).reduce")

with open("frontend/src/pages/career/aptitude/AssessmentReview.tsx", "w") as f:
    f.write(content)
