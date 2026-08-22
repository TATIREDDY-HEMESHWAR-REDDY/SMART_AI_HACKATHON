import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';
import { generateJson } from '@/lib/gemini';

export const runtime = 'nodejs';

type Insight = { category: string; status: string; title: string; detail: string; priority: 'warning' | 'positive' | 'info' };

export async function GET(request: Request) {
  const student = currentUser(request);
  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Student access required.' }, { status: 401 });
  }

  const attendance = db.prepare('SELECT subject, attended, total, trend, ROUND(attended * 100.0 / total) as percentage FROM subject_attendance').all();
  const marks = db.prepare('SELECT subject, internal_1 as internal1, internal_2 as internal2, assignment, credit FROM marks').all();
  const skills = db.prepare('SELECT name, level, score FROM skills ORDER BY score DESC').all();
  const opportunities = db.prepare('SELECT company, role, match_score as matchScore, deadline, gap FROM opportunities ORDER BY match_score DESC').all();
  const studentInfo = db.prepare('SELECT cgpa FROM students WHERE user_id = ?').get(student.id) as { cgpa: number } | undefined;

  const prompt = `You are an academic advisor AI for a college student named ${student.fullName}.
Analyze this data and produce actionable insights.

Attendance by subject: ${JSON.stringify(attendance)}
Internal marks by subject: ${JSON.stringify(marks)}
Skills: ${JSON.stringify(skills)}
Career opportunities being tracked: ${JSON.stringify(opportunities)}
Overall CGPA: ${studentInfo?.cgpa ?? 'unknown'}

Return a JSON array of 3 to 5 insight objects. Each object must have exactly these fields:
- "category": short label like "Attendance", "Academics", "Career", "Skills" (string)
- "status": a 2-4 word status like "Needs attention" or "On track" (string)
- "title": a short punchy headline (string, under 60 characters)
- "detail": one or two sentences of specific, actionable advice referencing the actual numbers above (string)
- "priority": one of "warning", "positive", or "info"

Order by importance, most urgent first. Return ONLY the JSON array, no markdown.`;

  try {
    const insights = await generateJson<Insight[]>(prompt);
    return NextResponse.json({ insights, generatedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('AI insights generation failed:', error, error?.cause);
    return NextResponse.json({ error: `${error.message || 'Failed to generate insights.'}${error?.cause ? ` (${error.cause})` : ''}` }, { status: 502 });
  }
}
