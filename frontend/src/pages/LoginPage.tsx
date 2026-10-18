import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Film,
  PenTool,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  Trophy,
  Star,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveLogo } from '@/components/interactive-logo';
import { useTopLoader } from '@/components/top-loader';
import {
  getAllProfiles,
  getCurrentUser,
  setCurrentUser,
  getAllCommunities,
  UserProfile,
} from '@/lib/user-profiles';

const ROLE_ICONS: Record<UserProfile['role'], React.ElementType> = {
  Developer: Code2,
  Editor: Film,
  'Content Writer': PenTool,
  'Business Analyst': BarChart3,
};

export function LoginPage() {
  const navigate = useNavigate();
  const { triggerPulse } = useTopLoader();
  const [activeUser, setActiveUser] = useState<UserProfile>(getCurrentUser());
  const profiles = getAllProfiles();
  const communities = getAllCommunities();

  useEffect(() => {
    setActiveUser(getCurrentUser());
  }, []);

  const handleSelectAccount = (profileId: string) => {
    triggerPulse();
    const selected = setCurrentUser(profileId);
    setActiveUser(selected);
    // Smooth redirect to home
    setTimeout(() => {
      navigate('/home');
    }, 280);
  };

  return (
    <div className="login-page-root">
      {/* Background glow effects */}
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />

      {/* Header bar */}
      <header className="login-topbar">
        <div className="login-logo-wrap">
          <InteractiveLogo size="md" />
        </div>
        <button
          type="button"
          className="login-skip-btn"
          onClick={() => navigate('/home')}
        >
          <span>Continue to Home</span>
          <ArrowRight size={16} />
        </button>
      </header>

      {/* Main Container */}
      <main className="login-main-container">
        {/* Title & Explanation */}
        <section className="login-hero-section">
          <div className="login-shield-badge">
            <ShieldCheck size={16} />
            <span>1-Click Seamless Authentication · No Passwords Required</span>
          </div>

          <h1 className="login-headline">
            Select an Account to Log In
          </h1>
          <p className="login-subheadline">
            Experience Amerigam tailored to each role: customized feeds, role-specific content,
            dedicated community circles, and creator stats update instantly according to your selection.
          </p>
        </section>

        {/* 4 Account Profile Cards Grid */}
        <section className="login-profiles-grid" aria-label="Available user accounts">
          {profiles.map((profile) => {
            const isCurrent = activeUser.id === profile.id;
            const Icon = (ROLE_ICONS as Record<string, React.ElementType>)[profile.role] || Code2;

            return (
              <motion.div
                key={profile.id}
                whileHover={{ y: -6, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`login-profile-card ${isCurrent ? 'active-profile' : ''}`}
                onClick={() => handleSelectAccount(profile.id)}
              >
                {/* Active Session Ribbon */}
                {isCurrent && (
                  <div className="login-active-ribbon">
                    <span className="pulse-dot" />
                    <span>Active Session</span>
                  </div>
                )}

                {/* Top Row: Avatar & Role Badge */}
                <div className="card-top-row">
                  <div className="login-avatar-wrap" style={{ borderColor: profile.themeColor }}>
                    <img src={profile.avatar_url} alt={profile.display_name} />
                    <span
                      className="login-role-icon-badge"
                      style={{ background: profile.themeColor }}
                    >
                      <Icon size={13} color="#fff" strokeWidth={2.4} />
                    </span>
                  </div>

                  <div className="card-badge-wrap">
                    <span
                      className="login-role-pill"
                      style={{
                        borderColor: profile.themeColor,
                        color: profile.themeColor,
                        background: `${profile.themeColor}18`,
                      }}
                    >
                      {profile.role}
                    </span>
                  </div>
                </div>

                {/* User Information */}
                <div className="card-user-info">
                  <h3 className="profile-display-name">{profile.display_name}</h3>
                  <span className="profile-handle">@{profile.username}</span>
                  <p className="profile-bio-text">{profile.bio}</p>
                </div>

                {/* Role Stats Row */}
                <div className="profile-stats-card">
                  <div className="stat-item">
                    <Trophy size={14} className="stat-icon" />
                    <div>
                      <strong>{profile.rank}</strong>
                      <small>Rank</small>
                    </div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <Zap size={14} className="stat-icon" />
                    <div>
                      <strong>{profile.points}</strong>
                      <small>Activity</small>
                    </div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <Star size={14} className="stat-icon" />
                    <div>
                      <strong>{profile.rating}</strong>
                      <small>Rating</small>
                    </div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="profile-skills-row">
                  {profile.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 4 && (
                    <span className="skill-chip more">+{profile.skills.length - 4}</span>
                  )}
                </div>

                {/* 1-Click Action Button */}
                <button
                  type="button"
                  className="login-select-btn"
                  style={{
                    background: isCurrent ? profile.themeColor : '#1e1f26',
                    borderColor: isCurrent ? profile.themeColor : '#323440',
                    color: isCurrent ? '#fff' : '#e0e1e6',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAccount(profile.id);
                  }}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle size={16} strokeWidth={2.4} />
                      <span>Logged In (Click to Continue)</span>
                    </>
                  ) : (
                    <>
                      <span>Log in as {profile.role}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </section>

        {/* Communities Showcase Row */}
        <section className="login-communities-section">
          <div className="section-title-row">
            <div>
              <h2 className="communities-title">
                <Users size={20} className="title-icon" />
                Featured Creator Communities
              </h2>
              <p className="communities-sub">
                Each profile belongs to specialized communities where creators share posts, reels, and blogs.
              </p>
            </div>
          </div>

          <div className="login-communities-grid">
            {communities.map((comm) => (
              <div key={comm.id} className="login-comm-card">
                <div
                  className="comm-card-banner"
                  style={{ backgroundImage: `url(${comm.banner})` }}
                >
                  <div className="comm-banner-scrim" />
                  <img src={comm.avatar} alt={comm.name} className="comm-avatar-badge" />
                </div>
                <div className="comm-card-body">
                  <div className="comm-name-row">
                    <h4>{comm.name}</h4>
                    <span className="comm-member-pill">{comm.members}</span>
                  </div>
                  <p className="comm-desc-text">{comm.description}</p>
                  <div className="comm-tags-row">
                    {comm.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="comm-tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
