import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const user = currentUser(request);
    if (!user) return NextResponse.json({ error: 'Sign in with your temporary password first.' }, { status: 401 });
    const { password } = await request.json();
    if (typeof password !== 'string' || password.length < 8) return NextResponse.json({ error: 'Choose a password with at least 8 characters.' }, { status: 400 });
    db.prepare('UPDATE users SET password=?, must_reset_password=0 WHERE id=?').run(password, user.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Password reset error stack:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message || error}` }, { status: 500 });
  }
}
