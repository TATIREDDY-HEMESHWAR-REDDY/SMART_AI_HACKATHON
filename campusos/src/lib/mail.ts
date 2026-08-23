import nodemailer from 'nodemailer';

export async function sendOnboardingEmail(input: { email: string; fullName: string; username: string; temporaryPassword: string; role: 'STUDENT' | 'TEACHER' | 'PARENT' }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, APP_URL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !MAIL_FROM) return { sent: false, reason: 'Mail is not configured. Add SMTP values to .env.local first.' };
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    tls: { rejectUnauthorized: false }
  });
  const roleLabel = input.role === 'STUDENT' ? 'student' : input.role === 'TEACHER' ? 'teacher' : 'parent';
  await transporter.sendMail({
    from: MAIL_FROM,
    to: input.email,
    subject: `Your CampusOS ${roleLabel} account is ready`,
    text: `Hello ${input.fullName},\n\nYour CampusOS account has been created.\n\nOpen ${APP_URL ?? 'http://localhost:3000'}?onboard=1\nUsername: ${input.username}\nTemporary password: ${input.temporaryPassword}\n\nFor security, you will be asked to reset your password immediately after your first sign-in.\n\nCampusOS Admin`,
  });
  return { sent: true };
}
