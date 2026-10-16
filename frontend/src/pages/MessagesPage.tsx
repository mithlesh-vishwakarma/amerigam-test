import React from 'react';
import { AppShell } from '@/components/app-shell';

export function MessagesPage() {
  return (
    <AppShell>
      <div style={{ padding: '0 0.5rem' }}>
        <h1 className="page-title">Messages</h1>
        <section className="two-pane">
          <aside>
            {['Aarav · Editor', 'Riya · Designer', 'Neel · Filmmaker'].map((x) => (
              <button key={x} type="button">
                {x}
              </button>
            ))}
          </aside>
          <div className="empty-state">Choose a conversation to start messaging.</div>
        </section>
      </div>
    </AppShell>
  );
}
export default MessagesPage;
