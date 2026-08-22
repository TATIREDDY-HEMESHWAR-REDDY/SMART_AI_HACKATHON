from app.db.database import Base

# Import all models here for Alembic
from app.career.profile.models import CareerProfile
from app.career.skills.models import StudentSkill
from app.career.readiness.models import CareerReadinessScore
from app.career.progress.models import CareerProgress
from app.career.ai_insights.models import AIInsight
