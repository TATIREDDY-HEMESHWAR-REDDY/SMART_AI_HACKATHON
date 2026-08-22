import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = currentUser(request);
    if (!user || user.role !== 'WARDEN') {
      return NextResponse.json({ error: 'Warden access required.' }, { status: 403 });
    }

    const requests = db.prepare(`
      SELECT 
        e.id, 
        e.duration_hours as durationHours, 
        e.reason, 
        e.status, 
        e.created_at as createdAt, 
        e.approved_at as approvedAt,
        u.full_name as studentName, 
        s.department, 
        s.student_phone as studentPhone, 
        s.parent_phone as parentPhone,
        (SELECT full_name FROM users WHERE role = 'TEACHER' AND section = u.section LIMIT 1) as classTeacherName
      FROM hostel_exits e
      JOIN users u ON u.id = e.user_id
      JOIN students s ON s.user_id = e.user_id
      ORDER BY e.status = 'PENDING' DESC, e.id DESC
    `).all();

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = currentUser(request);
    if (!user || user.role !== 'WARDEN') {
      return NextResponse.json({ error: 'Warden access required.' }, { status: 403 });
    }

    const { id, action } = await request.json();
    if (!id || !action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const approvedAt = action === 'APPROVE' ? new Date().toISOString() : null;

    db.prepare('UPDATE hostel_exits SET status = ?, approved_at = ? WHERE id = ?')
      .run(newStatus, approvedAt, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
