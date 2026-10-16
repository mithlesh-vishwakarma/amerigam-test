import React from 'react';
import { AppShell } from '@/components/app-shell';
import { ReelFeed } from '@/components/reel-feed';

export function FeedPage() {
  return (
    <AppShell right={false} isReelFeed>
      <ReelFeed />
    </AppShell>
  );
}
export default FeedPage;
