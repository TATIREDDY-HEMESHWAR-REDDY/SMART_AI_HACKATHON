with open("backend/app/career/assessments/service.py", "r") as f:
    content = f.read()

new_methods = """
    @staticmethod
    def delete_assessment(db: Session, assessment_id: int) -> bool:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            return False
        db.delete(assessment)
        db.commit()
        return True

    @staticmethod
    async def generate_assessment_with_ai(db: Session, prompt: str, category: str) -> Assessment:
        from app.ai.service import ai_service
        import json
        
        system_prompt = f\"\"\"
        Generate a 5-question multiple choice quiz for category '{category}' based on the user requirement: "{prompt}".
        Output strictly in JSON format matching this schema:
        {{
            "title": "A short engaging title",
            "description": "Brief description",
            "topic": "Main topic",
            "difficulty": "MEDIUM",
            "questions": [
                {{
                    "question_text": "The question",
                    "explanation": "Why the answer is correct",
                    "options": [
                        {{"id": "A", "text": "Option A"}},
                        {{"id": "B", "text": "Option B"}},
                        {{"id": "C", "text": "Option C"}},
                        {{"id": "D", "text": "Option D"}}
                    ],
                    "correct_option_id": "A"
                }}
            ]
        }}
        \"\"\"
        
        response = await ai_service.generate(system_prompt)
        start = response.find('{')
        end = response.rfind('}') + 1
        if start != -1 and end != -1:
            response = response[start:end]
            
        try:
            data = json.loads(response)
        except Exception:
            raise ValueError("Failed to parse AI response")
            
        assessment = Assessment(
            title=data.get("title", f"Custom {category} Quiz"),
            description=data.get("description", ""),
            category=category,
            topic=data.get("topic", "Custom"),
            difficulty=data.get("difficulty", "MEDIUM"),
            duration_minutes=10,
            total_questions=len(data.get("questions", [])),
            passing_score=60.0,
            is_active=True
        )
        db.add(assessment)
        db.flush()
        
        for idx, q_data in enumerate(data.get("questions", [])):
            q = AssessmentQuestion(
                assessment_id=assessment.id,
                question_text=q_data["question_text"],
                explanation=q_data["explanation"],
                topic=data.get("topic", "Custom"),
                difficulty=data.get("difficulty", "MEDIUM"),
                marks=1.0,
                negative_marks=0.0,
                options=q_data["options"],
                correct_option_id=q_data["correct_option_id"]
            )
            db.add(q)
            
        db.commit()
        db.refresh(assessment)
        return assessment
"""

content = content + "\n" + new_methods

with open("backend/app/career/assessments/service.py", "w") as f:
    f.write(content)
