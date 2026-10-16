import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import { MediaCard } from '@/components/post-card';
import { demoPosts } from '@/lib/demo-posts';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const tab = searchParams.get('tab') || '';

  const results = useMemo(() => {
    if (!q) return demoPosts;
    return demoPosts.filter((p) =>
      (p.title + ' ' + p.description + ' ' + (p.profiles?.username || '')).toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  return (
    <AppShell>
      <div style={{ padding: '0 0.5rem' }}>
        <h1 className="page-title">{tab ? (tab.charAt(0).toUpperCase() + tab.slice(1)) : 'Explore'}</h1>
        <div className="explore-search" style={{ marginBottom: '1.25rem', color: 'rgba(255, 255, 255, 0.65)' }}>
          {q ? `Results for "${q}"` : 'Search creative posts, creators, and communities'}
        </div>
        <section className="discover-grid">
          {results.map((p) => (
            <MediaCard post={p} key={p.id} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
export default SearchPage;
