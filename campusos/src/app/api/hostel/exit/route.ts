import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = currentUser(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
    }

    const requestRow = db.prepare('SELECT id, duration_hours as durationHours, reason, status, created_at as createdAt, approved_at as approvedAt FROM hostel_exits WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(user.id);
    return NextResponse.json({ activeRequest: requestRow || null });
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

    const { durationHours, reason } = await request.json();
    if (!durationHours || isNaN(Number(durationHours)) || Number(durationHours) <= 0) {
      return NextResponse.json({ error: 'Valid duration is required.' }, { status: 400 });
    }
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Reason for exit is required.' }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM hostel_exits WHERE user_id = ? AND status = 'PENDING'").get(user.id);
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending exit request.' }, { status: 400 });
    }

    db.prepare('INSERT INTO hostel_exits (user_id, duration_hours, reason, status, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(user.id, Number(durationHours), reason, 'PENDING', new Date().toISOString());

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
