import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const user = currentUser(request);
  if (!user) return NextResponse.json({ error: 'Login required.' }, { status: 401 });

  let announcements;
  if (user.role === 'ADMIN') {
    announcements = db.prepare(
      'SELECT id, title, message, author_name as authorName, author_role as authorRole, section, created_at as createdAt FROM announcements ORDER BY created_at DESC LIMIT 50'
    ).all();
  } else if (user.role === 'PARENT') {
    const children = db.prepare('SELECT section FROM students WHERE parent_user_id = ?').all(user.id) as { section: string }[];
    const sections = children.map((c) => c.section);
    if (sections.length === 0) {
      announcements = db.prepare('SELECT id, title, message, author_name as authorName, author_role as authorRole, section, created_at as createdAt FROM announcements WHERE section IS NULL ORDER BY created_at DESC LIMIT 50').all();
    } else {
      const placeholders = sections.map(() => '?').join(',');
      announcements = db.prepare(
        `SELECT id, title, message, author_name as authorName, author_role as authorRole, section, created_at as createdAt FROM announcements WHERE section IS NULL OR section IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`
      ).all(...sections);
    }
  } else {
    const section = user.section || 'A1';
    announcements = db.prepare(
      'SELECT id, title, message, author_name as authorName, author_role as authorRole, section, created_at as createdAt FROM announcements WHERE section IS NULL OR section = ? ORDER BY created_at DESC LIMIT 50'
    ).all(section);
  }

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const user = currentUser(request);
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Teacher or administrator access required.' }, { status: 403 });
  }

  const { title, message, section } = await request.json();
  if (!title || !message) return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });

  let targetSection: string | null = null;
  if (section && section !== 'ALL') {
    if (user.role === 'TEACHER' && section !== user.section) {
      return NextResponse.json({ error: 'Teachers can only post to their own section or campus-wide.' }, { status: 403 });
    }
    if (!['A1', 'B1', 'C1'].includes(section)) {
      return NextResponse.json({ error: 'Invalid section.' }, { status: 400 });
    }
    targetSection = section;
  }

  const createdAt = new Date().toISOString();
  const result = db.prepare(
    'INSERT INTO announcements (title, message, author_id, author_name, author_role, section, created_at) VALUES (?,?,?,?,?,?,?)'
  ).run(title.trim(), message.trim(), user.id, user.fullName, user.role, targetSection, createdAt);

  return NextResponse.json({ id: result.lastInsertRowid, title, message, section: targetSection, createdAt }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = currentUser(request);
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Teacher or administrator access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Announcement id is required.' }, { status: 400 });

  if (user.role === 'TEACHER') {
    const existing = db.prepare('SELECT author_id as authorId FROM announcements WHERE id = ?').get(id) as { authorId: number } | undefined;
    if (!existing || existing.authorId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own announcements.' }, { status: 403 });
    }
  }

  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
