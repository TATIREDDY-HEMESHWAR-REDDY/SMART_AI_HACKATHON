import { NextResponse } from 'next/server';
import { createSession, findUser } from '@/lib/db';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const { username, password } = await request.json();
  const user = findUser(String(username ?? ''), String(password ?? ''));
  if (!user) return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 });
  const response = NextResponse.json({ user });
  response.cookies.set('campusos-session', createSession(user.id), { httpOnly: true, sameSite: 'lax', path: '/' });
  return response;
}
