import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const { name, level, score } = await request.json();
  if (!name || !level || !Number.isFinite(Number(score))) return NextResponse.json({ error: 'Enter a skill, level, and score.' }, { status: 400 });
  try {
    const result = db.prepare('INSERT INTO skills (name, level, score) VALUES (?, ?, ?)').run(String(name).trim(), String(level), Math.min(100, Math.max(0, Number(score))));
    return NextResponse.json({ id: result.lastInsertRowid, name: String(name).trim(), level: String(level), score: Number(score) });
  } catch { return NextResponse.json({ error: 'That skill already exists.' }, { status: 409 }); }
}
