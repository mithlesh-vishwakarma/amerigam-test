import React from 'react';
import { AppShell } from '@/components/app-shell';
import { Feed } from '@/components/feed';

export function HomePage() {
  return (
    <AppShell>
      <Feed variant="home" />
    </AppShell>
  );
}
export default HomePage;
