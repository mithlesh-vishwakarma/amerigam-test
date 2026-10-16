import type { Metadata } from 'next';
import './globals.css';
import './home-ui.css';
import { TopLoaderProvider } from '@/components/top-loader';

export const metadata: Metadata = { title: 'Amerigam', description: 'Share creativity with your community' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TopLoaderProvider>{children}</TopLoaderProvider>
      </body>
    </html>
  );
}
