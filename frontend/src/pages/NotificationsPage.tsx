import React from 'react';
import { AppShell } from '@/components/app-shell';

export function NotificationsPage() {
  return (
    <AppShell>
      <div style={{ padding: '0 0.5rem' }}>
        <h1 className="page-title">Notifications</h1>
        <section className="notification-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '1rem', background: '#17171c', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ margin: 0, fontSize: '0.92rem' }}>
              <b>Aarav</b> liked your Golden hour colour study.{' '}
              <small style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>2m ago</small>
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#17171c', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ margin: 0, fontSize: '0.92rem' }}>
              <b>Amerigam</b> invited you to participate in Frame the extraordinary.{' '}
              <small style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>1h ago</small>
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
export default NotificationsPage;
