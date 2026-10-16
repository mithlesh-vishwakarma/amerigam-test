import React from 'react';
import { AppShell } from '@/components/app-shell';
import { Feed } from '@/components/feed';

export function FeedPage() {
  return (
    <AppShell right={false} isReelFeed>
      <Feed variant="feed" />
    </AppShell>
  );
}
export default FeedPage;
