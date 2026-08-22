import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const teacher = currentUser(request);
  if (!teacher || teacher.role !== 'TEACHER' || !teacher.section) return NextResponse.json({ error: 'Teacher access required.' }, { status: 403 });
  
  const { searchParams } = new URL(request.url);
  const selectedSection = searchParams.get('section') || teacher.section;
  
  const isClassTeacher = selectedSection === teacher.section;
  
  const students = db.prepare(`
    SELECT u.id as id, u.full_name as fullName, u.username, u.email, s.register_no as registerNo, s.cgpa, s.attendance, s.section, s.department 
    FROM students s 
    JOIN users u ON u.id=s.user_id 
    WHERE s.section=? 
    ORDER BY u.full_name
  `).all(selectedSection);

  const formattedStudents = students.map((s: any) => {
    if (isClassTeacher) {
      const fees = db.prepare('SELECT type, amount, paid, status FROM student_fees WHERE user_id = ?').get(s.id) as any;
      let details = null;
      if (fees) {
        if (fees.type === 'HOSTEL') {
          const hostel = db.prepare('SELECT room_no as roomNo, block_name as blockName, warden_name as wardenName FROM student_hostel WHERE user_id = ?').get(s.id) as any;
          if (hostel) {
            details = `Hostel: Room ${hostel.roomNo}, ${hostel.blockName} (Warden: ${hostel.wardenName})`;
          }
        } else {
          const trans = db.prepare('SELECT location, pickup_time as pickupTime, drop_time as dropTime FROM student_transport WHERE user_id = ?').get(s.id) as any;
          if (trans) {
            details = `Transport: ${trans.location} (Pickup: ${trans.pickupTime}, Drop: ${trans.dropTime})`;
          }
        }
      }
      return {
        ...s,
        feesBrief: fees ? `${fees.type} (${fees.status})` : 'None',
        allocationDetails: details || 'Not Assigned'
      };
    } else {
      return {
        id: s.id,
        fullName: s.fullName,
        registerNo: s.registerNo,
        attendance: s.attendance,
        section: s.section,
        cgpa: null,
        email: null,
        username: null,
        department: null
      };
    }
  });

  const aggregate = db.prepare('SELECT ROUND(AVG(cgpa),2) as averageCgpa, ROUND(AVG(attendance)) as averageAttendance, COUNT(*) as studentCount FROM students WHERE section=?').get(selectedSection);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const currentDay = (todayName === 'Sunday' || todayName === 'Saturday') ? 'Monday' : todayName;
  const timetable = db.prepare('SELECT time_slot as timeSlot, subject, classroom FROM timetable WHERE section = ? AND day = ? ORDER BY time_slot ASC').all(selectedSection, currentDay);
  const weekTimetable = db.prepare('SELECT day, time_slot as timeSlot, subject, classroom FROM timetable WHERE section = ? ORDER BY time_slot ASC').all(selectedSection);

  const announcements = db.prepare(
    'SELECT id, title, message, author_name as authorName, author_role as authorRole, section, created_at as createdAt FROM announcements WHERE author_id = ? OR section = ? ORDER BY created_at DESC LIMIT 20'
  ).all(teacher.id, selectedSection);

  return NextResponse.json({
    section: selectedSection,
    students: formattedStudents,
    aggregate,
    isClassTeacher,
    timetable,
    weekTimetable,
    announcements
  });
}

export async function POST(request: Request) {
  const teacher = currentUser(request);
  if (!teacher || teacher.role !== 'TEACHER') return NextResponse.json({ error: 'Teacher access required.' }, { status: 403 });
  
  const { studentId, attendance } = await request.json();
  if (!studentId || attendance === undefined) return NextResponse.json({ error: 'Student ID and attendance are required.' }, { status: 400 });
  
  const student = db.prepare('SELECT section FROM students WHERE user_id = ?').get(studentId) as { section: string } | undefined;
  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
  
  if (!['A1', 'B1', 'C1'].includes(student.section)) {
    return NextResponse.json({ error: 'Not authorized to update attendance for this section.' }, { status: 403 });
  }

  db.prepare('UPDATE students SET attendance = ? WHERE user_id = ?').run(Math.min(100, Math.max(0, Number(attendance))), studentId);
  return NextResponse.json({ success: true });
}
