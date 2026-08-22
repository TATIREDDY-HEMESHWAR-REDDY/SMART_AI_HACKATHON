import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';
import { getStudentOverview } from '@/lib/studentOverview';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const parent = currentUser(request);
  if (!parent || parent.role !== 'PARENT') {
    return NextResponse.json({ error: 'Parent access required.' }, { status: 401 });
  }

  const children = db.prepare(`
    SELECT u.id as id, u.full_name as fullName, s.register_no as registerNo, s.section, s.department, s.cgpa, s.attendance
    FROM students s JOIN users u ON u.id = s.user_id
    WHERE s.parent_user_id = ?
    ORDER BY u.full_name
  `).all(parent.id) as any[];

  if (children.length === 0) {
    return NextResponse.json({ children: [], selectedStudentId: null });
  }

  const { searchParams } = new URL(request.url);
  const requestedId = Number(searchParams.get('studentId'));
  const selected = children.find((c) => c.id === requestedId) || children[0];

  const overview = getStudentOverview(selected.id, selected.section);

  return NextResponse.json({
    children,
    selectedStudentId: selected.id,
    selectedStudent: selected,
    ...overview
  });
}
