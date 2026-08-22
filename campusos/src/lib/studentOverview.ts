import { db } from '@/lib/db';

export function getStudentOverview(studentId: number, section: string | null) {
  const attendance = db.prepare('SELECT subject, attended, total, trend, ROUND(attended * 100.0 / total) as percentage FROM subject_attendance').all();
  const insights = db.prepare('SELECT category, status, title, detail, priority FROM insights').all();
  const opportunities = db.prepare('SELECT company, role, package, match_score as matchScore, deadline, gap FROM opportunities ORDER BY match_score DESC').all();
  const marks = db.prepare('SELECT subject, internal_1 as internal1, internal_2 as internal2, assignment, end_sem_max as endSemMax, credit FROM marks').all();
  const skills = db.prepare('SELECT id, name, level, score FROM skills ORDER BY score DESC').all();

  const profile = db.prepare('SELECT phone, linkedin, github, portfolio, resume_name as resumeName, target_role as targetRole, completion FROM student_profile WHERE id = 1').get();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const currentDay = (todayName === 'Sunday' || todayName === 'Saturday') ? 'Monday' : todayName;

  const effectiveSection = section || 'A1';
  const timetable = db.prepare('SELECT time_slot as timeSlot, subject, classroom FROM timetable WHERE section = ? AND day = ? ORDER BY time_slot ASC').all(effectiveSection, currentDay);
  const weekTimetable = db.prepare('SELECT day, time_slot as timeSlot, subject, classroom FROM timetable WHERE section = ? ORDER BY time_slot ASC').all(effectiveSection);

  const fees = db.prepare('SELECT type, amount, paid, status FROM student_fees WHERE user_id = ?').get(studentId) as any;
  let allocationDetails = null;
  if (fees) {
    if (fees.type === 'HOSTEL') {
      allocationDetails = db.prepare('SELECT room_no as roomNo, block_name as blockName, warden_name as wardenName FROM student_hostel WHERE user_id = ?').get(studentId);
    } else {
      allocationDetails = db.prepare('SELECT location, pickup_time as pickupTime, drop_time as dropTime FROM student_transport WHERE user_id = ?').get(studentId);
    }
  }
  const feesWithDetails = fees ? { ...fees, details: allocationDetails } : null;

  const studentInfo = db.prepare('SELECT cgpa FROM students WHERE user_id = ?').get(studentId) as { cgpa: number } | undefined;
  const cgpa = studentInfo?.cgpa ?? 7.9;

  const announcements = db.prepare(
    'SELECT id, title, message, author_name as authorName, author_role as authorRole, section, created_at as createdAt FROM announcements WHERE section IS NULL OR section = ? ORDER BY created_at DESC LIMIT 20'
  ).all(effectiveSection);

  return {
    attendance,
    insights,
    opportunities,
    marks,
    skills,
    profile,
    timetable,
    weekTimetable,
    fees: feesWithDetails,
    announcements,
    academics: { sgpa: 8.1, cgpa, semester: 4, creditsCompleted: 78, creditsRemaining: 82 }
  };
}
