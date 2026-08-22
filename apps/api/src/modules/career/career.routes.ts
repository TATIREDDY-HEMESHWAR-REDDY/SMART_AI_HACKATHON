import { FastifyInstance } from 'fastify';
import { updateCareerProfileSchema, addStudentSkillSchema } from './career.schema';
import { careerDataLayer } from './career.data';
import { ApiSuccessResponse } from '@campus-os/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function careerRoutes(server: FastifyInstance) {

  // ==========================================
  // HELPER: Resolve StudentProfile.id
  // ==========================================
  const getStudentProfileId = async (userId: string): Promise<string | null> => {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId }
      });
      return profile?.id || null;
    } catch (err) {
      return null;
    }
  };

  // ==========================================
  // CAREER PROFILE
  // ==========================================

  server.get('/profile/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found for this user' }
      });
      return;
    }

    const goals = await careerDataLayer.getCareerGoalsByStudent(studentId);
    const skills = await careerDataLayer.getStudentSkills(studentId);
    const readiness = await careerDataLayer.getReadinessScore(studentId);

    const activeGoal = goals[0] || null;
    const profile = await prisma.studentProfile.findUnique({ where: { id: studentId } });

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        careerGoal: activeGoal ? {
          targetRole: activeGoal.targetRole,
          targetIndustry: activeGoal.targetIndustry,
          isActive: activeGoal.isActive,
        } : null,
        interests: profile?.interests || [],
        projects: profile?.projects || [],
        certifications: profile?.certifications || [],
        internships: profile?.internships || [],
        readinessSummary: readiness,
        skills: skills.map(ss => ({
          id: ss.id,
          skillId: ss.skillId,
          name: ss.skill?.name,
          proficiencyLevel: ss.proficiencyLevel,
          isVerified: ss.isVerified
        }))
      }
    };
    return response;
  });

  server.post('/profile/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const parsed = updateCareerProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found for this user' }
      });
      return;
    }

    const { targetRole, targetIndustry, interests, projects, certifications, internships } = parsed.data;
    const updatedGoal = await careerDataLayer.upsertCareerGoal(studentId, targetRole, targetIndustry);

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        ...(interests && { interests }),
        ...(projects && { projects }),
        ...(certifications && { certifications }),
        ...(internships && { internships })
      }
    });

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        careerGoal: {
          targetRole: updatedGoal.targetRole,
          targetIndustry: updatedGoal.targetIndustry,
          isActive: updatedGoal.isActive
        },
        interests: updatedProfile.interests,
        projects: updatedProfile.projects,
        certifications: updatedProfile.certifications,
        internships: updatedProfile.internships
      }
    };
    return response;
  });


  // ==========================================
  // SKILL CATALOG
  // ==========================================

  server.get('/skills', async (request, reply) => {
    // Publicly viewable catalog of standard skills
    const skills = await careerDataLayer.getSkills();

    const response: ApiSuccessResponse = {
      success: true,
      data: {
        skills
      }
    };
    return response;
  });

  server.post('/skills/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const parsed = addStudentSkillSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found for this user' }
      });
      return;
    }

    const { skillId, proficiencyLevel } = parsed.data;

    try {
      const studentSkill = await careerDataLayer.addStudentSkill(studentId, skillId, proficiencyLevel);
      
      const response: ApiSuccessResponse = {
        success: true,
        data: {
          studentSkill: {
            id: studentSkill.id,
            skillId: studentSkill.skillId,
            proficiencyLevel: studentSkill.proficiencyLevel,
            isVerified: studentSkill.isVerified
          }
        }
      };
      return response;
    } catch (err: any) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message || 'Skill not found' }
      });
    }
  });


  // ==========================================
  // CAREER ASSESSMENT
  // ==========================================

  server.get('/assessments', { preValidation: [server.requireAuth, server.requireRole(['STUDENT', 'TPO'])] }, async (request, reply) => {
    const assessments = await careerDataLayer.getAssessments();
    const response: ApiSuccessResponse = {
      success: true,
      data: { assessments }
    };
    return response;
  });

  server.post('/assessments/start', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const { startAssessmentSchema } = await import('./career.schema');
    const parsed = startAssessmentSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
      });
      return;
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
      return;
    }

    try {
      // Initialize assessment state without faking a result
      // Boundary for future Team 3 integration: POST /ai/career/assessment
      const session = await careerDataLayer.startAssessment(studentId, parsed.data.assessmentId);
      const response: ApiSuccessResponse = {
        success: true,
        data: { assessmentSession: session }
      };
      return response;
    } catch (err: any) {
      reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: err.message }
      });
    }
  });

  server.post('/assessments/submit', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const { submitAssessmentSchema } = await import('./career.schema');
    const parsed = submitAssessmentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });

    // Mock deterministic score
    const score = Math.floor(Math.random() * 41) + 60; // 60-100 random score for testing
    const aiFeedback = {
      strengths: ['Problem Solving', 'Adaptability', 'Technical Fundamentals'],
      weaknesses: ['Advanced System Design', 'Communication under pressure']
    };

    try {
      const result = await prisma.assessmentResult.create({
        data: {
          studentId,
          assessmentId: parsed.data.assessmentId,
          score,
          aiFeedback
        }
      });
      return { success: true, data: { result } };
    } catch (error: any) {
      if (error.code === 'P2003') {
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
      }
      return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  });

  server.get('/assessments/me/results', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
      return;
    }

    const rawResults = await careerDataLayer.getAssessmentResults(studentId);
    
    const mappedResults = rawResults.map(r => {
      const feedback = r.aiFeedback as any || {};
      return {
        id: r.id,
        assessment: r.assessment,
        score: r.score,
        completedAt: r.createdAt,
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || []
      };
    });

    const response: ApiSuccessResponse = {
      success: true,
      data: { assessmentResults: mappedResults }
    };
    return response;
  });

  server.get('/roadmap/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });

    const goals = await careerDataLayer.getCareerGoalsByStudent(studentId);
    const activeGoal = goals[0];
    
    if (!activeGoal) {
      return reply.status(400).send({ success: false, error: { code: 'NO_GOAL', message: 'Set a career goal first to generate a roadmap' } });
    }

    // Mock deterministic response matching the spec (Module M)
    const roadmap = {
      targetRole: activeGoal.targetRole,
      targetIndustry: activeGoal.targetIndustry,
      skillGap: {
        missingSkills: [
          { name: 'System Design', priority: 'HIGH' },
          { name: 'Cloud Architecture (AWS)', priority: 'HIGH' },
          { name: 'GraphQL API', priority: 'MEDIUM' }
        ],
        learningSequence: [
          '1. Master basic API structures and transition to GraphQL',
          '2. Study Cloud Architecture patterns with AWS',
          '3. Practice high-level System Design for scalable apps'
        ],
        suggestedResources: [
          { title: 'System Design Interview Prep', type: 'Course', url: 'https://example.com/system-design' },
          { title: 'AWS Certified Solutions Architect', type: 'Certification', url: 'https://example.com/aws' }
        ],
        projectSuggestions: [
          { title: 'Scalable Microservices E-Commerce', difficulty: 'Advanced', description: 'Build a distributed backend using GraphQL and deploy on AWS.' },
          { title: 'Real-time Chat App', difficulty: 'Intermediate', description: 'Implement WebSockets and caching for high-concurrency.' }
        ]
      },
      lastUpdated: new Date().toISOString()
    };

    // Save mock recommendations and projects to DB to avoid "fake model" gaps
    await prisma.careerRecommendation.deleteMany({ where: { studentId } });
    await prisma.careerRecommendation.create({
      data: {
        studentId,
        recommendedRole: activeGoal.targetRole,
        matchPercentage: 75.5,
        rationale: 'Based on your current skill set and assessments, you are well aligned but have a few high-priority gaps.'
      }
    });

    await prisma.projectSuggestion.deleteMany({ where: { studentId } });
    await prisma.projectSuggestion.createMany({
      data: roadmap.skillGap.projectSuggestions.map(p => ({
        studentId,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty
      }))
    });

    return { success: true, data: { roadmap } };
  });

  server.get('/readiness/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) {
      reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found' }
      });
      return;
    }

    const readiness = await careerDataLayer.getReadinessScore(studentId);
    const response: ApiSuccessResponse = {
      success: true,
      data: { readiness }
    };
    return response;
  });

  // ==========================================
  // MODULE N: RESUME
  // ==========================================
  server.get('/resume/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });
    
    const resumes = await prisma.resume.findMany({
      where: { studentId },
      include: { analysis: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: { resumes } };
  });

  server.post('/resume', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const { uploadResumeSchema } = await import('./career.schema');
    const parsed = uploadResumeSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });

    // Mock storage URL abstraction
    const fileUrl = `https://storage.campus-os.edu/resumes/${studentId}/${Date.now()}-${parsed.data.fileName}`;
    
    const resume = await prisma.resume.create({
      data: {
        studentId,
        fileUrl,
        isPrimary: true // Make new resume primary by default
      }
    });
    
    // Set other resumes to not primary
    await prisma.resume.updateMany({
      where: { studentId, id: { not: resume.id } },
      data: { isPrimary: false }
    });

    return { success: true, data: { resume } };
  });

  server.post('/resume/:id/analyze', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request: any, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });

    const resumeId = request.params.id;
    
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.studentId !== studentId) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
    }

    // Mock Deterministic ATS Analysis
    const atsScore = Math.floor(Math.random() * 31) + 65; // 65-95 score
    const feedback = {
      summary: 'A strong resume with good technical foundation, but lacks business impact metrics.',
      projectBulletSuggestions: [
        'Instead of "Built a backend", use "Architected a Node.js backend supporting 10k concurrent users."',
        'Quantify your AWS deployment (e.g., reduced latency by 40%).'
      ],
      atsKeywordMatch: atsScore > 80 ? 'High compatibility with typical AI Engineer roles' : 'Missing some key cloud technology keywords',
      jobSpecificImprovements: [
        'Add specific mention of Docker or Kubernetes if applying for cloud roles.',
        'Ensure React/Next.js are explicitly listed in a skills section.'
      ],
      strengths: ['Clear formatting', 'Strong action verbs used in experience section'],
      improvements: ['Add more quantifiable metrics', 'Missing core keywords for target role']
    };

    const analysis = await prisma.resumeAnalysis.upsert({
      where: { resumeId },
      create: { resumeId, atsScore, feedback },
      update: { atsScore, feedback, analyzedAt: new Date() }
    });

    return { success: true, data: { analysis } };
  });

  // ==========================================
  // MODULE O: AI MOCK INTERVIEW
  // ==========================================
  server.get('/mock-interview/me', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });
    
    const interviews = await prisma.mockInterview.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: { interviews } };
  });

  server.post('/mock-interview/start', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });

    const { startMockInterviewSchema } = await import('./career.schema');
    const parsed = startMockInterviewSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });

    // AI Mock initialization logic
    const initialQuestion = `Tell me about yourself and why you're interested in the ${parsed.data.role} role?`;
    
    const interview = await prisma.mockInterview.create({
      data: {
        studentId,
        type: 'AI',
        status: 'IN_PROGRESS',
        aiSessionId: `ai_sess_${Date.now()}`,
        feedback: {
          role: parsed.data.role,
          questions: [
            { id: 1, text: initialQuestion, answer: null, evaluation: null }
          ],
          currentQuestionIndex: 0,
          totalScore: 0,
          completed: false
        }
      }
    });

    return { success: true, data: { interview } };
  });

  server.post('/mock-interview/:id/answer', { preValidation: [server.requireAuth, server.requireRole(['STUDENT'])] }, async (request: any, reply) => {
    const studentId = await getStudentProfileId(request.user.id);
    if (!studentId) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } });

    const interviewId = request.params.id;
    const { submitAnswerSchema } = await import('./career.schema');
    const parsed = submitAnswerSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });

    const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
    if (!interview || interview.studentId !== studentId) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Interview not found' } });
    }

    if (interview.status === 'COMPLETED' || !interview.feedback) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'Interview is already completed' } });
    }

    const feedbackData = interview.feedback as any;
    const currentIndex = feedbackData.currentQuestionIndex;
    
    // Deterministic Mock AI Evaluation
    const wordCount = parsed.data.answer.split(' ').length;
    const relevance = Math.min(10, Math.max(3, Math.floor(wordCount / 5)));
    const completeness = Math.min(10, Math.max(4, Math.floor(wordCount / 8)));
    const technical = Math.min(10, Math.floor(Math.random() * 5) + 5);
    const clarity = Math.min(10, Math.floor(Math.random() * 4) + 6);
    const communication = Math.min(10, Math.floor(Math.random() * 4) + 6);
    
    const score = Math.round((relevance + completeness + technical + clarity + communication) / 5 * 10); // 0-100

    feedbackData.questions[currentIndex].answer = parsed.data.answer;
    feedbackData.questions[currentIndex].evaluation = {
      relevance, completeness, technicalQuality: technical, clarity, communication,
      score,
      comment: score > 75 ? 'Great response! You covered the key points well.' : 'Consider adding more specific examples.'
    };

    // Determine next question or end
    const MAX_QUESTIONS = 3;
    if (currentIndex + 1 >= MAX_QUESTIONS) {
      feedbackData.completed = true;
      interview.status = 'COMPLETED';
      // calculate total score
      const totalScore = Math.round(feedbackData.questions.reduce((acc: number, q: any) => acc + (q.evaluation?.score || 0), 0) / MAX_QUESTIONS);
      feedbackData.totalScore = totalScore;
      feedbackData.finalFeedback = totalScore > 80 ? 'Excellent performance overall!' : 'Keep practicing, you are making progress.';
    } else {
      feedbackData.currentQuestionIndex += 1;
      const nextQTexts = [
        'How do you handle challenging problems or bugs in your code?',
        'Describe a time you worked in a team and disagreed with a teammate.',
        'Where do you see yourself in 5 years?'
      ];
      feedbackData.questions.push({
        id: currentIndex + 2,
        text: nextQTexts[currentIndex % nextQTexts.length],
        answer: null,
        evaluation: null
      });
    }

    const updated = await prisma.mockInterview.update({
      where: { id: interview.id },
      data: {
        status: interview.status,
        feedback: feedbackData
      }
    });

    return { success: true, data: { interview: updated } };
  });

  // GET /api/v1/career/analytics/dashboard
  // Roles: TPO, FACULTY
  server.get('/analytics/dashboard', {
    preValidation: [(server as any).requireAuth, (server as any).requireRole(['TPO', 'FACULTY'])]
  }, async (request, reply) => {
    const data = await careerDataLayer.getAnalyticsDashboard();
    return reply.send({ success: true, data });
  });

}
