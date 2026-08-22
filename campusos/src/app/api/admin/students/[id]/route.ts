import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = currentUser(request);
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });

  const { id } = await params;
  const userId = Number(id);

  const student = db.prepare(`
    SELECT u.id as id, u.username, u.full_name as fullName, u.email, u.must_reset_password as mustResetPassword,
           s.register_no as registerNo, s.department, s.section, s.cgpa, s.attendance, s.student_phone as studentPhone, s.parent_phone as parentPhone
    FROM students s JOIN users u ON u.id = s.user_id
    WHERE u.id = ?
  `).get(userId) as any;

  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  const fees = db.prepare('SELECT type, amount, paid, status FROM student_fees WHERE user_id = ?').get(userId) as any;
  let allocation = null;
  if (fees) {
    allocation = fees.type === 'HOSTEL'
      ? db.prepare('SELECT room_no as roomNo, block_name as blockName, warden_name as wardenName FROM student_hostel WHERE user_id = ?').get(userId)
      : db.prepare('SELECT location, pickup_time as pickupTime, drop_time as dropTime, route_no as routeNo, driver_name as driverName, driver_phone as driverPhone FROM student_transport WHERE user_id = ?').get(userId);
  }

  const safetyIncidents = db.prepare('SELECT id, type, title, description, status, created_at as createdAt FROM safety_incidents WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const wellbeingCheckins = db.prepare('SELECT id, mood_score as moodScore, notes, created_at as createdAt FROM wellbeing_checkins WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const hostelExits = db.prepare('SELECT id, duration_hours as durationHours, reason, status, created_at as createdAt, approved_at as approvedAt FROM hostel_exits WHERE user_id = ? ORDER BY created_at DESC').all(userId);

  return NextResponse.json({
    student,
    fees: fees ? { ...fees, allocation } : null,
    safetyIncidents,
    wellbeingCheckins,
    hostelExits
  });
}
