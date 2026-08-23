import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = currentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    if (user.role === 'STUDENT') {
      const checkins = db.prepare('SELECT id, mood_score as moodScore, notes, created_at as createdAt FROM wellbeing_checkins WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
      return NextResponse.json({ checkins });
    }

    if (user.role === 'TEACHER') {
      if (!user.section) return NextResponse.json({ error: 'Teacher home section not assigned.' }, { status: 400 });
      // Fetch checkins from students in their home section
      const checkins = db.prepare(`
        SELECT w.id, w.mood_score as moodScore, w.notes, w.created_at as createdAt, u.full_name as studentName 
        FROM wellbeing_checkins w 
        JOIN users u ON u.id = w.user_id 
        WHERE u.section = ? 
        ORDER BY w.created_at DESC
      `).all(user.section);

      return NextResponse.json({ checkins });
    }

    if (user.role === 'ADMIN') {
      const checkins = db.prepare(`
        SELECT w.id, w.mood_score as moodScore, w.notes, w.created_at as createdAt, u.full_name as studentName, u.section 
        FROM wellbeing_checkins w 
        JOIN users u ON u.id = w.user_id 
        ORDER BY w.created_at DESC
      `).all();

      return NextResponse.json({ checkins });
    }

    if (user.role === 'PARENT') {
      const { searchParams } = new URL(request.url);
      const requestedId = Number(searchParams.get('studentId'));
      const child = requestedId
        ? db.prepare('SELECT user_id as userId FROM students WHERE user_id = ? AND parent_user_id = ?').get(requestedId, user.id) as any
        : db.prepare('SELECT user_id as userId FROM students WHERE parent_user_id = ? ORDER BY user_id LIMIT 1').get(user.id) as any;

      if (!child) return NextResponse.json({ checkins: [] });

      const checkins = db.prepare('SELECT id, mood_score as moodScore, notes, created_at as createdAt FROM wellbeing_checkins WHERE user_id = ? ORDER BY created_at DESC').all(child.userId);
      return NextResponse.json({ checkins });
    }

    return NextResponse.json({ error: 'Invalid role access.' }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = currentUser(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
    }

    const { moodScore, notes } = await request.json();
    if (moodScore === undefined || isNaN(Number(moodScore)) || Number(moodScore) < 1 || Number(moodScore) > 5) {
      return NextResponse.json({ error: 'Enter a valid mood score from 1 to 5.' }, { status: 400 });
    }

    db.prepare('INSERT INTO wellbeing_checkins (user_id, mood_score, notes, created_at) VALUES (?, ?, ?, ?)')
      .run(user.id, Number(moodScore), notes || '', new Date().toISOString());

    return NextResponse.json({ success: true, message: 'Wellbeing check-in saved.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
