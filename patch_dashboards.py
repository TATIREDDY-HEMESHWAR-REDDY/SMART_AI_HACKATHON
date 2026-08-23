import os

dashboards = [
    ("frontend/src/pages/career/aptitude/AptitudeDashboard.tsx", "APTITUDE"),
    ("frontend/src/pages/career/technical/TechnicalDashboard.tsx", "TECHNICAL"),
    ("frontend/src/pages/career/communication/CommunicationDashboard.tsx", "COMMUNICATION")
]

for file_path, category in dashboards:
    with open(file_path, "r") as f:
        content = f.read()
        
    if "GenerateQuizSection" not in content:
        content = content.replace("import { AssessmentCard } from '@/components/career/assessments/AssessmentCard';", "import { AssessmentCard } from '@/components/career/assessments/AssessmentCard';\nimport { GenerateQuizSection } from '@/components/career/assessments/GenerateQuizSection';")
        
        insert_marker = "</div>\n\n      <div className=\"grid"
        insert_code = f"</div>\n\n      <GenerateQuizSection category=\"{category}\" />\n\n      <div className=\"grid"
        content = content.replace(insert_marker, insert_code)
        
        with open(file_path, "w") as f:
            f.write(content)
