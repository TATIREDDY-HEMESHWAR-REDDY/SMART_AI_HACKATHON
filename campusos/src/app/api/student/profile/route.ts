import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export const runtime = 'nodejs';
export async function PUT(request: Request) {
  const { phone = '', linkedin = '', github = '', portfolio = '', resumeName = '', targetRole = 'Software Engineer' } = await request.json();
  const completion = [phone, linkedin, github, portfolio, resumeName].filter(Boolean).length * 20;
  db.prepare('UPDATE student_profile SET phone=?, linkedin=?, github=?, portfolio=?, resume_name=?, target_role=?, completion=? WHERE id=1').run(phone, linkedin, github, portfolio, resumeName, targetRole, completion);
  return NextResponse.json({ phone, linkedin, github, portfolio, resumeName, targetRole, completion });
}
