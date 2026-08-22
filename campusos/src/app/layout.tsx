import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'CampusOS', description: 'AI-Powered College Operating System' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
