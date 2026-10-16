import React from 'react';
import { AppShell } from '@/components/app-shell';
import { Trophy } from 'lucide-react';

export function CompetitionsPage() {
  return (
    <AppShell>
      <div style={{ padding: '0 0.5rem' }}>
        <h1 className="page-title">Competitions</h1>
        <section className="competition">
          <Trophy size={35} color="#00a8ed" />
          <div>
            <small style={{ color: '#00a8ed', fontWeight: 600 }}>OPEN COMPETITION</small>
            <h2 style={{ fontSize: '1.25rem', margin: '0.25rem 0' }}>Frame the extraordinary</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Share your strongest visual story. Submit a Post or Reel by 30 October.
            </p>
            <button
              type="button"
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: '#00a8ed',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View competition
            </button>
          </div>
        </section>
        <section className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.6 }}>
          More competitions will appear here as they open.
        </section>
      </div>
    </AppShell>
  );
}
export default CompetitionsPage;
