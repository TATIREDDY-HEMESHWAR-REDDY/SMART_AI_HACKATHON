import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { randomUUID } from 'node:crypto';

const databasePath = path.join(process.cwd(), 'data', 'campusos.db');
export const db = new DatabaseSync(databasePath, { open: true });

function runMigrations() {
  try { db.exec('ALTER TABLE students ADD COLUMN parent_user_id INTEGER'); } catch { /* column already exists */ }
  db.exec(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    section TEXT,
    created_at TEXT NOT NULL
  )`);
}
runMigrations();

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'WARDEN' | 'PARENT';
export type CurrentUser = { id: number; username: string; role: Role; fullName: string; section: string | null; email: string; mustResetPassword: number };
export function findUser(username: string, password: string) {
  return db.prepare('SELECT id, username, role, full_name as fullName, section, email, must_reset_password as mustResetPassword FROM users WHERE username = ? AND password = ?').get(username, password) as CurrentUser | undefined;
}
export function createSession(userId: number) {
  const token = randomUUID();
  db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(token, userId, new Date().toISOString());
  return token;
}
export function currentUser(request: Request) {
  const token = request.headers.get('cookie')?.match(/(?:^|; )campusos-session=([^;]+)/)?.[1];
  if (!token) return undefined;
  return db.prepare('SELECT u.id, u.username, u.role, u.full_name as fullName, u.section, u.email, u.must_reset_password as mustResetPassword FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(token) as CurrentUser | undefined;
}
