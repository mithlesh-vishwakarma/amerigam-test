import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import {
  Shield,
  Bell,
  Moon,
  User,
  Lock,
  HelpCircle,
  Sparkles,
  Briefcase,
  Heart,
  Megaphone,
  Check,
  Plus,
} from 'lucide-react';
import { getCurrentUser, updateUserHobbies, AUTH_CHANGED_EVENT } from '@/lib/user-profiles';

const AVAILABLE_HOBBIES = [
  'Gaming',
  'Photography',
  'Cinema & Film',
  'Music Production',
  'Fitness & Marathons',
  'Travel & Culture',
  'Chess & Strategy',
  'Literature & Books',
  'Art & Sketching',
  'Tech Gadgets',
  'Mechanical Keyboards',
  'Sound Design',
];

export function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [customHobbyInput, setCustomHobbyInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
  }, []);

  const userHobbies = currentUser.hobbies || [];

  const handleToggleHobby = (hobby: string) => {
    const exists = userHobbies.includes(hobby);
    const updated = exists ? userHobbies.filter((h) => h !== hobby) : [...userHobbies, hobby];
    updateUserHobbies(currentUser.id, updated);
    setCurrentUser(getCurrentUser());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleAddCustomHobby = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customHobbyInput.trim();
    if (!trimmed) return;
    if (!userHobbies.includes(trimmed)) {
      const updated = [...userHobbies, trimmed];
      updateUserHobbies(currentUser.id, updated);
      setCurrentUser(getCurrentUser());
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2200);
    }
    setCustomHobbyInput('');
  };

  return (
    <AppShell>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 0.5rem 3rem' }}>
        <h1 className="page-title" style={{ marginBottom: '1.25rem' }}>Settings</h1>

        {/* 70 / 20 / 10 Feed Algorithm Preferences */}
        <div className="settings-ratio-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-ratio-header">
            <div className="settings-ratio-title-box">
              <div className="settings-ratio-icon-wrap">
                <Sparkles size={22} />
              </div>
              <div>
                <b style={{ display: 'block', fontSize: '1rem', color: '#fff' }}>
                  Feed Algorithm & Content Distribution
                </b>
                <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                  70% Professional Field • 20% Personal Hobbies • 10% Sponsored
                </small>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 9px',
                borderRadius: '20px',
                background: 'rgba(0, 168, 237, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(0, 168, 237, 0.3)',
              }}
            >
              Exact 7:2:1 Ratio
            </span>
          </div>

          {/* Visual Distribution Ratio Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="feed-ratio-bar-track" style={{ height: '7px' }}>
              <div className="feed-ratio-bar-field" style={{ width: '70%' }} title="70% Professional Field" />
              <div className="feed-ratio-bar-hobby" style={{ width: '20%' }} title="20% Personal Hobbies" />
              <div className="feed-ratio-bar-ad" style={{ width: '10%' }} title="10% Sponsored Brands" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8' }}>
              <span style={{ color: '#38bdf8' }}>70% Field ({currentUser.role})</span>
              <span style={{ color: '#f472b6' }}>20% Hobbies ({userHobbies.length} active)</span>
              <span style={{ color: '#fbbf24' }}>10% Sponsored</span>
            </div>
          </div>

          {/* 1. Field Row */}
          <div
            style={{
              padding: '0.9rem',
              borderRadius: '10px',
              background: 'rgba(0, 168, 237, 0.05)',
              border: '1px solid rgba(0, 168, 237, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(0, 168, 237, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Briefcase size={16} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  Professional Field (70%)
                </span>
                <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                  Guaranteed majority of your home feed matches your role
                </small>
              </div>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(0, 168, 237, 0.12)',
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              {currentUser.role}
            </span>
          </div>

          {/* 2. Hobbies Selection */}
          <div
            style={{
              padding: '0.9rem',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.05)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: '#f472b6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  Your Passions & Hobbies (20%)
                </span>
                <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                  Toggle topics you love to populate 20% of your feed stream
                </small>
              </div>
            </div>

            {/* Hobby Pill Grid */}
            <div className="settings-hobbies-grid">
              {AVAILABLE_HOBBIES.map((hobby) => {
                const isActive = userHobbies.includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    className={`settings-hobby-toggle-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleToggleHobby(hobby)}
                  >
                    {isActive ? <Check size={13} /> : <Plus size={13} />}
                    <span>{hobby}</span>
                  </button>
                );
              })}

              {/* Any custom hobbies user added */}
              {userHobbies
                .filter((h) => !AVAILABLE_HOBBIES.includes(h))
                .map((customH) => (
                  <button
                    key={customH}
                    type="button"
                    className="settings-hobby-toggle-btn active"
                    onClick={() => handleToggleHobby(customH)}
                  >
                    <Check size={13} />
                    <span>{customH}</span>
                  </button>
                ))}
            </div>

            {/* Add Custom Hobby Form */}
            <form onSubmit={handleAddCustomHobby} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                value={customHobbyInput}
                onChange={(e) => setCustomHobbyInput(e.target.value)}
                placeholder="Add custom hobby (e.g. Vinyl Records, Archery, Bouldering)..."
                className="details-text-input"
                style={{
                  flex: 1,
                  background: '#1b1c22',
                  border: '1px solid #2e2f3a',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                }}
              />
              <button
                type="submit"
                disabled={!customHobbyInput.trim()}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'rgba(236, 72, 153, 0.25)',
                  border: '1px solid #ec4899',
                  color: '#f472b6',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: customHobbyInput.trim() ? 'pointer' : 'not-allowed',
                  opacity: customHobbyInput.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
            </form>
          </div>

          {/* 3. Ads Notice */}
          <div
            style={{
              padding: '0.9rem',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Megaphone size={16} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  Sponsored Brand Posts (10%)
                </span>
                <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                  Transparently capped at 1 post every 10 items in your stream
                </small>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#fbbf24',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              1 in 10
            </span>
          </div>

          {savedNotice && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={14} />
              <span>Feed preferences saved in real time! Your home feed will refresh with this hobby mix.</span>
            </div>
          )}
        </div>

        {/* Standard Settings Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: User, title: 'Account Information', desc: 'Manage your profile, handle, and avatar' },
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
