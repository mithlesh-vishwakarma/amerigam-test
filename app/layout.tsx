import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Amerigam', description: 'Share creativity with your community' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
