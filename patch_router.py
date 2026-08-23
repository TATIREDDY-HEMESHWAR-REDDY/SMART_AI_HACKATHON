with open("backend/app/career/assessments/router.py", "r") as f:
    content = f.read()

import_patch = """from .schemas import AssessmentResponse, AssessmentQuestionPublic, AssessmentAttemptResponse, AnswerUpdate, AssessmentResultResponse, AssessmentQuestionWithAnswer, GenerateAssessmentRequest"""
content = content.replace("from .schemas import AssessmentResponse, AssessmentQuestionPublic, AssessmentAttemptResponse, AnswerUpdate, AssessmentResultResponse, AssessmentQuestionWithAnswer", import_patch)

new_routes = """
@router.post("/assessments/generate", response_model=AssessmentResponse)
async def generate_assessment(
    req: GenerateAssessmentRequest,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    try:
        assessment = await AssessmentService.generate_assessment_with_ai(db, req.prompt, req.category)
        return assessment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate assessment: {str(e)}")

@router.delete("/assessments/{id}")
async def delete_assessment(
    id: int,
    student_id: str = Depends(get_current_student_id),
    db: Session = Depends(get_db)
):
    success = AssessmentService.delete_assessment(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return {"status": "ok"}
"""

content = content + "\n" + new_routes

with open("backend/app/career/assessments/router.py", "w") as f:
    f.write(content)
