import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/db';
import { getStudentOverview } from '@/lib/studentOverview';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const student = currentUser(request);
  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Student access required.' }, { status: 401 });
  }
  return NextResponse.json(getStudentOverview(student.id, student.section));
}
