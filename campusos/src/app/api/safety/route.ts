import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = currentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    if (user.role === 'STUDENT') {
      const incidents = db.prepare('SELECT id, type, title, description, status, created_at as createdAt FROM safety_incidents WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
      return NextResponse.json({ incidents, visitors: [] });
    }

    if (user.role === 'TEACHER') {
      if (!user.section) return NextResponse.json({ error: 'Teacher home section not assigned.' }, { status: 400 });
      // Fetch incidents reported by students in their section
      const incidents = db.prepare(`
        SELECT i.id, i.type, i.title, i.description, i.status, i.created_at as createdAt, u.full_name as studentName 
        FROM safety_incidents i 
        JOIN users u ON u.id = i.user_id 
        WHERE u.section = ? 
        ORDER BY i.created_at DESC
      `).all(user.section);

      const visitors = db.prepare('SELECT id, name, purpose, host_name as hostName, in_time as inTime, out_time as outTime, status FROM visitors ORDER BY in_time DESC').all();
      return NextResponse.json({ incidents, visitors });
    }

    if (user.role === 'ADMIN') {
      const incidents = db.prepare(`
        SELECT i.id, i.type, i.title, i.description, i.status, i.created_at as createdAt, u.full_name as studentName, u.section 
        FROM safety_incidents i 
        JOIN users u ON u.id = i.user_id 
        ORDER BY i.created_at DESC
      `).all();

      const visitors = db.prepare('SELECT id, name, purpose, host_name as hostName, in_time as inTime, out_time as outTime, status FROM visitors ORDER BY in_time DESC').all();
      return NextResponse.json({ incidents, visitors });
    }

    if (user.role === 'PARENT') {
      const { searchParams } = new URL(request.url);
      const requestedId = Number(searchParams.get('studentId'));
      const child = requestedId
        ? db.prepare('SELECT user_id as userId FROM students WHERE user_id = ? AND parent_user_id = ?').get(requestedId, user.id) as any
        : db.prepare('SELECT user_id as userId FROM students WHERE parent_user_id = ? ORDER BY user_id LIMIT 1').get(user.id) as any;

      if (!child) return NextResponse.json({ incidents: [] });

      const incidents = db.prepare('SELECT id, type, title, description, status, created_at as createdAt FROM safety_incidents WHERE user_id = ? ORDER BY created_at DESC').all(child.userId);
      return NextResponse.json({ incidents });
    }

    return NextResponse.json({ error: 'Invalid role access.' }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = currentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const body = await request.json();

    if (user.role === 'STUDENT') {
      const { type, title, description } = body;
      if (!type || !title || !description) {
        return NextResponse.json({ error: 'Type, title, and description are required.' }, { status: 400 });
      }

      db.prepare('INSERT INTO safety_incidents (user_id, type, title, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(user.id, type, title, description, 'OPEN', new Date().toISOString());

      return NextResponse.json({ success: true, message: 'Incident reported successfully.' }, { status: 201 });
    }

    // Admins and Teachers can log visitor check-in, check-out, and trigger emergency broadcasts
    const { action } = body;
    if (!action) return NextResponse.json({ error: 'Action is required.' }, { status: 400 });

    if (action === 'CHECK_IN') {
      const { name, purpose, hostName } = body;
      if (!name || !purpose || !hostName) {
        return NextResponse.json({ error: 'Visitor name, purpose, and host name are required.' }, { status: 400 });
      }
      db.prepare('INSERT INTO visitors (name, purpose, host_name, in_time, out_time, status) VALUES (?, ?, ?, ?, null, ?)')
        .run(name, purpose, hostName, new Date().toISOString(), 'ACTIVE');
      return NextResponse.json({ success: true, message: 'Visitor checked in successfully.' }, { status: 201 });
    }

    if (action === 'CHECK_OUT') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Visitor record ID is required.' }, { status: 400 });
      db.prepare('UPDATE visitors SET out_time = ?, status = ? WHERE id = ?')
        .run(new Date().toISOString(), 'COMPLETED', Number(id));
      return NextResponse.json({ success: true, message: 'Visitor checked out successfully.' });
    }

    if (action === 'RESOLVE_INCIDENT') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Incident ID is required.' }, { status: 400 });
      db.prepare('UPDATE safety_incidents SET status = ? WHERE id = ?').run('RESOLVED', Number(id));
      return NextResponse.json({ success: true, message: 'Incident marked as resolved.' });
    }

    if (action === 'BROADCAST') {
      const { message } = body;
      if (!message) return NextResponse.json({ error: 'Broadcast message is required.' }, { status: 400 });
      // In a real application, we would send alerts or push notifications.
      // We will simulate it by adding a special incident log representing the broadcast message.
      db.prepare('INSERT INTO safety_incidents (user_id, type, title, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(user.id, 'EMERGENCY', 'Broadcast Alert', message, 'RESOLVED', new Date().toISOString());
      return NextResponse.json({ success: true, message: 'Emergency broadcast message sent.' });
    }

    return NextResponse.json({ error: 'Action not supported.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
