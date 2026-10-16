import React from 'react';
import { AppShell } from '@/components/app-shell';
import { Shield, Bell, Moon, User, Lock, HelpCircle } from 'lucide-react';

export function SettingsPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 0.5rem' }}>
        <h1 className="page-title">Settings</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { icon: User, title: 'Account Information', desc: 'Manage your profile and handle' },
            { icon: Lock, title: 'Privacy & Security', desc: 'Control who can view your posts and reels' },
            { icon: Bell, title: 'Notifications', desc: 'Push notifications and email alerts' },
            { icon: Moon, title: 'Appearance & Display', desc: 'Dark theme, OLED blacks, and contrast' },
            { icon: Shield, title: 'Safety & Moderation', desc: 'Blocked accounts and sensitive filters' },
            { icon: HelpCircle, title: 'Help & Support', desc: 'FAQs and contacting the team' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#16161b',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(0, 168, 237, 0.1)',
                  color: '#00a8ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <b style={{ display: 'block', fontSize: '0.95rem' }}>{title}</b>
                <small style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{desc}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
export default SettingsPage;
