import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const events = db.prepare('SELECT id, title, type, date, description, section FROM calendar_events ORDER BY date ASC').all();
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = currentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const { title, type, date, description, section } = await request.json();
    if (!title || !type || !date) {
      return NextResponse.json({ error: 'Title, type, and date are required.' }, { status: 400 });
    }

    const info = db.prepare('INSERT INTO calendar_events (title, type, date, description, section) VALUES (?, ?, ?, ?, ?)')
      .run(title, type, date, description || '', section || null);

    return NextResponse.json({ id: info.lastInsertRowid, title, type, date, description, section }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = currentUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    }

    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
