import random
from typing import List, Dict, Any

FALLBACK_QUESTIONS = {
    "TECHNICAL": [
        {"question": "Explain how a hash table works internally, including collision resolution.", "category": "TECHNICAL", "difficulty": "MEDIUM", "expected_topics": ["Data Structures", "Hashing"]},
        {"question": "What is the difference between processes and threads?", "category": "TECHNICAL", "difficulty": "EASY", "expected_topics": ["Operating Systems", "Concurrency"]},
        {"question": "Describe the four pillars of Object-Oriented Programming with examples.", "category": "TECHNICAL", "difficulty": "EASY", "expected_topics": ["OOP", "Design"]},
        {"question": "How do you design a scalable URL shortener system?", "category": "TECHNICAL", "difficulty": "HARD", "expected_topics": ["System Design", "Scalability", "Hashing"]},
        {"question": "Explain the concepts of ACID properties in databases.", "category": "TECHNICAL", "difficulty": "MEDIUM", "expected_topics": ["DBMS", "Transactions"]},
        {"question": "Describe what happens when you type a URL into a browser and press enter.", "category": "TECHNICAL", "difficulty": "MEDIUM", "expected_topics": ["Computer Networks", "DNS", "HTTP"]}
    ],
    "BEHAVIORAL": [
        {"question": "Tell me about a time you faced a significant technical challenge. How did you overcome it?", "category": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_topics": ["Problem Solving", "Resilience"]},
        {"question": "Describe a situation where you had a disagreement with a team member. How was it resolved?", "category": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_topics": ["Conflict Resolution", "Teamwork"]},
        {"question": "Tell me about a project that failed or didn't go as planned. What did you learn?", "category": "BEHAVIORAL", "difficulty": "HARD", "expected_topics": ["Failure", "Growth Mindset"]},
        {"question": "Give an example of a time when you had to step up as a leader.", "category": "BEHAVIORAL", "difficulty": "MEDIUM", "expected_topics": ["Leadership", "Initiative"]},
        {"question": "Describe a time when you had to meet a tight deadline. How did you handle the pressure?", "category": "BEHAVIORAL", "difficulty": "EASY", "expected_topics": ["Time Management", "Pressure"]}
    ],
    "HR": [
        {"question": "Tell me a little bit about yourself and your background.", "category": "HR", "difficulty": "EASY", "expected_topics": ["Introduction", "Communication"]},
        {"question": "What are your greatest strengths and weaknesses?", "category": "HR", "difficulty": "EASY", "expected_topics": ["Self-awareness"]},
        {"question": "Where do you see yourself in five years?", "category": "HR", "difficulty": "EASY", "expected_topics": ["Career Goals", "Ambition"]},
        {"question": "Why are you interested in this particular role and our company?", "category": "HR", "difficulty": "EASY", "expected_topics": ["Motivation", "Company Fit"]},
        {"question": "What is your expected salary and preferred work environment?", "category": "HR", "difficulty": "EASY", "expected_topics": ["Expectations"]}
    ],
    "PROJECT": [
        {"question": "Walk me through the architecture of your most complex project.", "category": "PROJECT", "difficulty": "HARD", "expected_topics": ["Architecture", "Design Decisions"]},
        {"question": "What was the hardest technical tradeoff you had to make in your recent project?", "category": "PROJECT", "difficulty": "MEDIUM", "expected_topics": ["Tradeoffs", "Decision Making"]},
        {"question": "How did you ensure code quality and testing in your project?", "category": "PROJECT", "difficulty": "MEDIUM", "expected_topics": ["Testing", "Quality Assurance"]},
        {"question": "If you had to rebuild your project from scratch today, what would you do differently?", "category": "PROJECT", "difficulty": "MEDIUM", "expected_topics": ["Reflection", "System Design"]},
        {"question": "What technologies did you choose for your project and why?", "category": "PROJECT", "difficulty": "EASY", "expected_topics": ["Technology Stack", "Justification"]}
    ]
}

def get_fallback_questions(interview_type: str, num_questions: int) -> List[Dict[str, Any]]:
    questions_pool = []
    
    if interview_type == "MIXED":
        # Pull evenly from all categories
        for cat in FALLBACK_QUESTIONS.values():
            questions_pool.extend(cat)
    elif interview_type in FALLBACK_QUESTIONS:
        questions_pool.extend(FALLBACK_QUESTIONS[interview_type])
    else:
        questions_pool.extend(FALLBACK_QUESTIONS["TECHNICAL"])
        
    random.shuffle(questions_pool)
    return questions_pool[:num_questions]
