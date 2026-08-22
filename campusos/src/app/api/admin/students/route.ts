import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';
import { sendOnboardingEmail } from '@/lib/mail';

export const runtime = 'nodejs';
function requireAdmin(request: Request) { const user = currentUser(request); return user?.role === 'ADMIN' ? user : undefined; }

export async function GET(request: Request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const students = db.prepare(`SELECT u.id as id, u.username, u.full_name as fullName, u.email, s.register_no as registerNo, s.department, s.section, s.cgpa, s.attendance, s.parent_user_id as parentUserId FROM students s JOIN users u ON u.id=s.user_id ORDER BY s.section, u.full_name`).all();
  const teachers = db.prepare(`SELECT id, username, full_name as fullName, email, section FROM users WHERE role='TEACHER' ORDER BY section`).all();
  const parents = db.prepare(`
    SELECT u.id as id, u.username, u.full_name as fullName, u.email,
           (SELECT us.full_name FROM students s2 JOIN users us ON us.id = s2.user_id WHERE s2.parent_user_id = u.id) as childName
    FROM users u WHERE u.role = 'PARENT' ORDER BY u.full_name
  `).all();
  return NextResponse.json({ students, teachers, parents });
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const body = await request.json();
  const { accountType = 'STUDENT', username, password, fullName, email, registerNo, department = 'Computer Science', section, cgpa = 0, attendance = 0,
    createParent, parentFullName, parentUsername, parentPassword, parentEmail } = body;
  const role = accountType === 'TEACHER' ? 'TEACHER' : 'STUDENT';
  if (!username || !password || !fullName || !email || !['A1', 'B1', 'C1'].includes(section) || (role === 'STUDENT' && !registerNo)) {
    return NextResponse.json({ error: `Enter all required ${role.toLowerCase()} details and choose A1, B1, or C1.` }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });

  const wantsParent = role === 'STUDENT' && createParent;
  if (wantsParent && (!parentFullName || !parentUsername || !parentPassword || !parentEmail)) {
    return NextResponse.json({ error: 'Enter all parent account details, or turn off parent enrollment.' }, { status: 400 });
  }
  if (wantsParent && !/^\S+@\S+\.\S+$/.test(parentEmail)) return NextResponse.json({ error: 'Enter a valid parent email address.' }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();
  const normalizedParentEmail = wantsParent ? parentEmail.trim().toLowerCase() : null;
  const normalizedParentUsername = wantsParent ? parentUsername.trim() : null;

  if (wantsParent && normalizedParentEmail === normalizedEmail) {
    return NextResponse.json({ error: 'The parent email must be different from the student email.' }, { status: 409 });
  }
  if (wantsParent && normalizedParentUsername === normalizedUsername) {
    return NextResponse.json({ error: 'The parent username must be different from the student username.' }, { status: 409 });
  }

  const emailsToCheck = wantsParent ? [normalizedEmail, normalizedParentEmail] : [normalizedEmail];
  const usernamesToCheck = wantsParent ? [normalizedUsername, normalizedParentUsername] : [normalizedUsername];
  const existing = db.prepare(
    `SELECT username, email FROM users WHERE email IN (${emailsToCheck.map(() => '?').join(',')}) OR username IN (${usernamesToCheck.map(() => '?').join(',')})`
  ).all(...emailsToCheck, ...usernamesToCheck) as { username: string; email: string }[];
  if (existing.length > 0) {
    const conflict = existing[0];
    const field = emailsToCheck.includes(conflict.email) ? 'email address' : 'username';
    return NextResponse.json({ error: `That ${field} (${field === 'email address' ? conflict.email : conflict.username}) is already registered to another account.` }, { status: 409 });
  }

  let createdUserId: number | undefined;
  let parentUserId: number | null = null;

  try {
    db.exec('BEGIN');
    try {
      const user = db.prepare('INSERT INTO users (username,password,role,full_name,section,email,must_reset_password) VALUES (?,?,?,?,?,?,1)').run(normalizedUsername, password, role, fullName.trim(), section, normalizedEmail);
      createdUserId = Number(user.lastInsertRowid);

      if (role === 'STUDENT') {
        if (wantsParent) {
          const parentUser = db.prepare('INSERT INTO users (username,password,role,full_name,section,email,must_reset_password) VALUES (?,?,?,?,?,?,1)').run(normalizedParentUsername, parentPassword, 'PARENT', parentFullName.trim(), section, normalizedParentEmail);
          parentUserId = Number(parentUser.lastInsertRowid);
        }
        db.prepare('INSERT INTO students (user_id,register_no,department,section,cgpa,attendance,parent_user_id) VALUES (?,?,?,?,?,?,?)').run(createdUserId, registerNo.trim(), department, section, Number(cgpa), Number(attendance), parentUserId);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error('Enrollment error details:', error);
    return NextResponse.json({ error: `Enrollment failed: ${error.message || 'database error.'}` }, { status: 409 });
  }

  let parentResult: any = null;
  if (parentUserId) {
    const parentMail = await sendOnboardingEmail({ email: parentEmail.trim(), fullName: parentFullName, username: parentUsername, temporaryPassword: parentPassword, role: 'PARENT' });
    parentResult = { id: parentUserId, username: normalizedParentUsername, fullName: parentFullName, email: normalizedParentEmail, mail: parentMail };
  }
  const mail = await sendOnboardingEmail({ email: normalizedEmail, fullName, username: normalizedUsername, temporaryPassword: password, role });
  return NextResponse.json({ id: createdUserId, username: normalizedUsername, fullName, email: normalizedEmail, registerNo, department, section, cgpa: Number(cgpa), attendance: Number(attendance), accountType: role, mail, parent: parentResult }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  if (!idStr) return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  const id = Number(idStr);
  try {
    const studentRow = db.prepare('SELECT parent_user_id as parentUserId FROM students WHERE user_id = ?').get(id) as { parentUserId: number | null } | undefined;
    db.prepare('DELETE FROM students WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    if (studentRow?.parentUserId) {
      const remainingChildren = db.prepare('SELECT COUNT(*) as count FROM students WHERE parent_user_id = ?').get(studentRow.parentUserId) as { count: number };
      if (remainingChildren.count === 0) {
        db.prepare('DELETE FROM sessions WHERE user_id = ?').run(studentRow.parentUserId);
        db.prepare('DELETE FROM users WHERE id = ?').run(studentRow.parentUserId);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error details:', error);
    return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 500 });
  }
}
