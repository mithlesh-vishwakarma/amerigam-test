import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Globe,
  Users,
  Search,
  Check,
  Plus,
  Share2,
  Sparkles,
  Layers,
  ArrowRight,
  Code2,
  Film,
  PenTool,
  BarChart3,
  Play,
  UserCheck,
  UserPlus,
  Filter,
  X,
  Compass,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { MediaCard } from '@/components/post-card';
import { CONTENT_UPDATED_EVENT } from '@/lib/content-store';
import {
  getAllCommunities,
  getAllProfiles,
  getCurrentUser,
  CommunityProfile,
  UserProfile,
} from '@/lib/user-profiles';
import { useTopLoader } from '@/components/top-loader';
import {
  fetchCommunities,
  fetchPosts,
  fetchProfiles,
  toggleJoinCommunityApi,
  toggleFollowApi,
} from '@/lib/api';
import type { Post, ReelItem } from '@/lib/types';

interface SearchPageProps {
  defaultTab?: 'explore' | 'communities' | 'network';
}

const POPULAR_TAGS = [
  'All',
  'TypeScript',
  'DaVinci Resolve',
  'WebGL',
  'Storytelling',
  'Economics',
  'Cinema',
  'Product Growth',
  'Algorithms',
];

export function SearchPage({ defaultTab = 'explore' }: SearchPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerPulse } = useTopLoader();

  // Determine active primary view from route or query param
  const activePathTab = useMemo(() => {
    if (location.pathname === '/communities') return 'communities';
    if (location.pathname === '/network') return 'network';
    if (location.pathname === '/explore') return 'explore';
    return (searchParams.get('tab') as 'explore' | 'communities' | 'network') || defaultTab;
  }, [location.pathname, searchParams, defaultTab]);

  const q = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(q);
  const [contentFilter, setContentFilter] = useState<'all' | 'post' | 'blog' | 'reel' | 'community' | 'creator'>('all');
  const [selectedTag, setSelectedTag] = useState('All');
  const [networkRoleFilter, setNetworkRoleFilter] = useState<string>('All');

  // Live Database State
  const [communities, setCommunities] = useState<CommunityProfile[]>(getAllCommunities());
  const initialCommId = searchParams.get('comm') || communities[0]?.id || 'comm-dev';
  const [selectedCommId, setSelectedCommId] = useState<string>(initialCommId);
  const [communityKindFilter, setCommunityKindFilter] = useState<'all' | 'post' | 'blog' | 'reel'>('all');
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({
    'comm-dev': true,
    'comm-cinema': true,
  });

  // Creator network connect state
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({
    'user-dev': true,
  });

  // Dynamic reactive data from live backend database
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(getAllProfiles());

  const allReels: ReelItem[] = useMemo(() => {
    return allPosts
      .filter((p) => p.kind === 'reel')
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        video_url: p.media_urls?.[0] || '/media/reel-1.mp4',
        poster_url:
          p.poster_url ||
          p.media_urls?.[0] ||
          'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        creator: {
          id: p.profiles?.id || p.author_id,
          name: p.profiles?.display_name || 'Creator',
          username: p.profiles?.username || 'creator',
          avatar: p.profiles?.avatar_url || '',
          initial: (p.profiles?.display_name || 'C')[0],
          role: p.profiles?.role || 'Creator',
        },
        likes: p.like_count ?? 0,
        comments: p.comment_count ?? 0,
        shares: 0,
        views: p.views ?? 0,
        duration: p.duration || '0:30',
      }));
  }, [allPosts]);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const loadBackendData = useCallback(async () => {
    try {
      const user = getCurrentUser();
      const [postsRes, commsRes, profsRes] = await Promise.all([
        fetchPosts({ q: q || undefined, viewer_id: user.id }),
        fetchCommunities({ q: q || undefined, viewer_id: user.id }),
        fetchProfiles(),
      ]);

      if (postsRes) {
        setAllPosts(postsRes);
      }
      if (commsRes && commsRes.length > 0) {
        setCommunities(commsRes);
        const newJoined: Record<string, boolean> = {};
        commsRes.forEach((c) => {
          if (c.joined) newJoined[c.id] = true;
        });
        setJoinedMap((prev) => ({ ...prev, ...newJoined }));
      }
      if (profsRes && profsRes.length > 0) {
        setAllProfiles(profsRes);
      }
    } catch (err) {
      console.warn('SearchPage backend fetch error:', err);
    }
  }, [q]);

  useEffect(() => {
    loadBackendData();
    window.addEventListener(CONTENT_UPDATED_EVENT, loadBackendData);
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, loadBackendData);
  }, [loadBackendData]);

  const toggleJoin = async (id: string) => {
    triggerPulse();
    const user = getCurrentUser();
    setJoinedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      await toggleJoinCommunityApi(id, user.id);
    } catch (err) {
      console.warn('Backend toggleJoin error:', err);
    }
  };

  const toggleConnect = async (id: string) => {
    triggerPulse();
    const user = getCurrentUser();
    setConnectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      await toggleFollowApi(user.id, id);
    } catch (err) {
      console.warn('Backend toggleConnect error:', err);
    }
  };

  const handleTabChange = (newTab: 'explore' | 'communities' | 'network') => {
    triggerPulse();
    if (newTab === 'communities') navigate('/communities');
    else if (newTab === 'network') navigate('/network');
    else navigate('/explore' + (q ? `?q=${encodeURIComponent(q)}` : ''));
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerPulse();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  // 1. FILTERED POSTS & BLOGS
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      // Content kind filter
      if (contentFilter === 'post' && post.kind !== 'post') return false;
      if (contentFilter === 'blog' && post.kind !== 'blog') return false;
      if (contentFilter === 'reel' || contentFilter === 'community' || contentFilter === 'creator') return false;

      // Tag filter
      if (selectedTag !== 'All') {
        const text = (post.title + ' ' + post.description).toLowerCase();
        if (!text.includes(selectedTag.toLowerCase())) return false;
      }

      // Query filter
      if (q) {
        const queryLower = q.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(queryLower);
        const matchDesc = post.description.toLowerCase().includes(queryLower);
        const matchAuthor = (post.profiles?.display_name || '').toLowerCase().includes(queryLower) ||
          (post.profiles?.username || '').toLowerCase().includes(queryLower);
        const matchKind = post.kind.toLowerCase().includes(queryLower);
        return matchTitle || matchDesc || matchAuthor || matchKind;
      }

      return true;
    });
  }, [allPosts, contentFilter, selectedTag, q]);

  // 2. FILTERED REELS
  const filteredReels = useMemo(() => {
    if (contentFilter === 'post' || contentFilter === 'blog' || contentFilter === 'community' || contentFilter === 'creator') {
      return [];
    }
    return allReels.filter((reel) => {
      if (selectedTag !== 'All') {
        const text = (reel.title + ' ' + reel.description).toLowerCase();
        if (!text.includes(selectedTag.toLowerCase())) return false;
      }
      if (q) {
        const queryLower = q.toLowerCase();
        const matchTitle = reel.title.toLowerCase().includes(queryLower);
        const matchDesc = reel.description.toLowerCase().includes(queryLower);
        const matchCreator = (reel.creator?.name || '').toLowerCase().includes(queryLower) ||
          (reel.creator?.username || '').toLowerCase().includes(queryLower);
        return matchTitle || matchDesc || matchCreator;
      }
      return true;
    });
  }, [allReels, contentFilter, selectedTag, q]);

  // 3. FILTERED COMMUNITIES
  const filteredCommunities = useMemo(() => {
    if (contentFilter === 'post' || contentFilter === 'blog' || contentFilter === 'reel' || contentFilter === 'creator') {
      return [];
    }
    return communities.filter((comm) => {
      if (selectedTag !== 'All') {
        const hasTag = comm.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()));
        if (!hasTag) return false;
      }
      if (q) {
        const queryLower = q.toLowerCase();
        return (
          comm.name.toLowerCase().includes(queryLower) ||
          comm.category.toLowerCase().includes(queryLower) ||
          comm.description.toLowerCase().includes(queryLower) ||
          comm.tags.some((t) => t.toLowerCase().includes(queryLower))
        );
      }
      return true;
    });
  }, [communities, contentFilter, selectedTag, q]);

  // 4. FILTERED CREATORS / NETWORK
  const filteredCreators = useMemo(() => {
    return allProfiles.filter((creator) => {
      if (networkRoleFilter !== 'All' && creator.role !== networkRoleFilter) return false;
      if (contentFilter === 'post' || contentFilter === 'blog' || contentFilter === 'reel' || contentFilter === 'community') {
        return false;
      }
      if (selectedTag !== 'All') {
        const hasSkill = creator.skills.some((s) => s.toLowerCase().includes(selectedTag.toLowerCase()));
        if (!hasSkill && !creator.role.toLowerCase().includes(selectedTag.toLowerCase())) return false;
      }
      if (q) {
        const queryLower = q.toLowerCase();
        return (
          creator.display_name.toLowerCase().includes(queryLower) ||
          creator.username.toLowerCase().includes(queryLower) ||
          creator.role.toLowerCase().includes(queryLower) ||
          creator.bio.toLowerCase().includes(queryLower) ||
          creator.skills.some((s) => s.toLowerCase().includes(queryLower))
        );
      }
      return true;
    });
  }, [allProfiles, networkRoleFilter, contentFilter, selectedTag, q]);

  // Selected Community for Communities view
  const selectedCommunity = communities.find((c) => c.id === selectedCommId) || communities[0];
  const communityPostsRaw = useMemo(() => {
    if (!selectedCommId) return [];
    return allPosts.filter((p) => (p as any).community_id === selectedCommId);
  }, [allPosts, selectedCommId]);
  const selectedCommunityPosts = useMemo(() => {
    if (communityKindFilter === 'all') return communityPostsRaw;
    return communityPostsRaw.filter((p) => p.kind === communityKindFilter);
  }, [communityPostsRaw, communityKindFilter]);

  const totalResultsCount =
    filteredPosts.length + filteredReels.length + (q ? filteredCommunities.length + filteredCreators.length : 0);

  return (
    <AppShell>
      <div className="search-page-content" style={{ padding: '0 0.5rem 5rem' }}>
        {/* Navigation Tabs for Explore / Communities / Network (Distinct Routes & Styling) */}
        <div className="search-tab-nav-row" style={{ marginTop: '0.25rem' }}>
          <button
            type="button"
            className={`search-nav-pill ${activePathTab === 'explore' ? 'active' : ''}`}
            onClick={() => handleTabChange('explore')}
          >
            <Compass size={16} />
            <span>Explore & Search</span>
          </button>
          <button
            type="button"
            className={`search-nav-pill ${activePathTab === 'communities' ? 'active' : ''}`}
            onClick={() => handleTabChange('communities')}
          >
            <Globe size={16} />
            <span>Communities Hub</span>
          </button>
          <button
            type="button"
            className={`search-nav-pill ${activePathTab === 'network' ? 'active' : ''}`}
            onClick={() => handleTabChange('network')}
          >
            <Users size={16} />
            <span>Creator Network</span>
          </button>
        </div>

        {/* =========================================================
            1. COMMUNITIES VIEW (/communities)
            ========================================================= */}
        {activePathTab === 'communities' && (
          <section className="communities-hub-section">
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={24} color="#00a8ed" />
                <span>Communities Hub</span>
              </h1>
              <p style={{ color: '#8c8e98', fontSize: '13px', margin: '4px 0 0' }}>
                Join vertical guilds, share specialized knowledge, and collaborate across technical & artistic domains.
              </p>
            </div>

            {/* Community Selector Header Tabs */}
            <div className="community-pills-selector">
              {communities.map((comm) => (
                <button
                  key={comm.id}
                  type="button"
                  className={`comm-selector-btn ${selectedCommId === comm.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCommId(comm.id);
                    triggerPulse();
                  }}
                >
                  <img src={comm.avatar} alt={comm.name} className="comm-btn-avatar" />
                  <span>{comm.name}</span>
                  {joinedMap[comm.id] && <span className="joined-indicator">Joined</span>}
                </button>
              ))}
            </div>

            {/* Selected Community Full Profile Card */}
            {selectedCommunity && (
              <motion.div
                key={selectedCommunity.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="community-detail-hero"
              >
                {/* Banner */}
                <div
                  className="community-hero-banner"
                  style={{ backgroundImage: `url(${selectedCommunity.banner})` }}
                >
                  <div className="community-banner-overlay" />
                  <span className="community-hero-category">{selectedCommunity.category}</span>
                </div>

                {/* Profile Header Meta */}
                <div className="community-hero-body">
                  <div className="community-hero-main-row">
                    <div className="community-avatar-col">
                      <img
                        src={selectedCommunity.avatar}
                        alt={selectedCommunity.name}
                        className="community-hero-avatar"
                      />
                    </div>

                    <div className="community-hero-info">
                      <div className="community-hero-title-row">
                        <h2 className="community-hero-title">{selectedCommunity.name}</h2>
                        <span className="community-hero-handle">{selectedCommunity.handle}</span>
                      </div>
                      <p className="community-hero-desc">{selectedCommunity.description}</p>
                    </div>

                    <div className="community-hero-actions">
                      <button
                        type="button"
                        className={`community-join-btn ${joinedMap[selectedCommunity.id] ? 'is-joined' : ''}`}
                        onClick={() => toggleJoin(selectedCommunity.id)}
                      >
                        {joinedMap[selectedCommunity.id] ? (
                          <>
                            <Check size={16} strokeWidth={2.4} />
                            <span>Joined</span>
                          </>
                        ) : (
                          <>
                            <Plus size={16} strokeWidth={2.4} />
                            <span>Join Hub</span>
                          </>
                        )}
                      </button>

                      <Link to="/create" className="community-post-cta-btn">
                        <span>Share to Hub</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>

                  {/* Community Stats & Tags */}
                  <div className="community-meta-footer">
                    <div className="community-stats-row">
                      <span className="meta-stat">
                        <Users size={15} />
                        <strong>{selectedCommunity.members}</strong>
                      </span>
                      <span className="meta-divider">·</span>
                      <span className="meta-stat">
                        <Layers size={15} />
                        <strong>{selectedCommunityPosts.length + 18} Shares & Blogs</strong>
                      </span>
                    </div>

                    <div className="community-tags-list">
                      {selectedCommunity.tags.map((tag) => (
                        <span key={tag} className="comm-tag-pill">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Community Content Filters & Feed */}
                <div className="community-content-feed">
                  <div className="feed-header-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <h3 className="feed-section-heading">
                      <Sparkles size={16} color="#00a8ed" />
                      Shared in {selectedCommunity.name}
                    </h3>

                    {/* Kind Filter for Community Posts */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['all', 'post', 'blog', 'reel'] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setCommunityKindFilter(k)}
                          style={{
                            background: communityKindFilter === k ? '#0077e6' : '#1e1f25',
                            border: '1px solid #32333d',
                            color: communityKindFilter === k ? '#fff' : '#9ca3af',
                            borderRadius: '14px',
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {k === 'all' ? 'All Content' : k + 's'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="discover-grid">
                    {selectedCommunityPosts.length > 0 ? (
                      selectedCommunityPosts.map((post) => (
                        <MediaCard post={post} key={post.id} />
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No posts published in this community yet.</p>
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>Be the first to share content with this community!</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        )}

        {/* =========================================================
            2. CREATOR NETWORK VIEW (/network)
            ========================================================= */}
        {activePathTab === 'network' && (
          <section className="network-page-section">
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={24} color="#00a8ed" />
                <span>Creator Network</span>
              </h1>
              <p style={{ color: '#8c8e98', fontSize: '13px', margin: '4px 0 0' }}>
                Connect directly with verified Developers, Film Editors, Content Writers, and Product Analysts.
              </p>
            </div>

            {/* Role Filter Pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
              {['All', 'Developer', 'Editor', 'Content Writer', 'Business Analyst'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setNetworkRoleFilter(r);
                    triggerPulse();
                  }}
                  className={`search-nav-pill ${networkRoleFilter === r ? 'active' : ''}`}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Creator Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredCreators.map((creator) => {
                const isConnected = !!connectedMap[creator.id];
                return (
                  <div
                    key={creator.id}
                    style={{
                      background: '#141518',
                      border: '1px solid #25262f',
                      borderRadius: 16,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          border: `2px solid ${creator.themeColor}`,
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ color: '#fff', fontSize: '15px', display: 'block' }}>
                          {creator.display_name}
                        </b>
                        <small style={{ color: creator.themeColor, fontWeight: 600 }}>
                          {creator.role} · {creator.rank}
                        </small>
                        <span style={{ color: '#8e8e98', fontSize: '11px', display: 'block' }}>
                          @{creator.username}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: '#9ea0aa', fontSize: '12px', margin: 0, lineHeight: 1.45, minHeight: 36 }}>
                      {creator.bio}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {creator.skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: '#1c1d24',
                            border: '1px solid #282933',
                            color: '#9aa0a6',
                            fontSize: '10.5px',
                            padding: '2px 7px',
                            borderRadius: 6,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #202128', paddingTop: 12, marginTop: 4 }}>
                      <span style={{ color: '#8e8e98', fontSize: '11px' }}>
                        ⭐ {creator.rating} · <strong>{creator.points}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleConnect(creator.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: isConnected ? '#1f2027' : '#0077e6',
                          border: isConnected ? '1px solid #343542' : 'none',
                          color: isConnected ? '#34d399' : '#fff',
                          borderRadius: 20,
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isConnected ? <UserCheck size={14} /> : <UserPlus size={14} />}
                        <span>{isConnected ? 'Connected' : 'Connect'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================
            3. EXPLORE & LIVE SEARCH VIEW (/explore or /search)
            ========================================================= */}
        {activePathTab === 'explore' && (
          <section className="explore-search-section">
            {/* Search Header Banner */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 className="page-title" style={{ margin: '0 0 6px 0' }}>
                {q ? `Search Results for "${q}"` : 'Explore Feed'}
              </h1>
              <p style={{ color: '#8c8e98', fontSize: '13px', margin: 0 }}>
                {q
                  ? `Found ${totalResultsCount} matching posts, reels, communities and creators.`
                  : 'Discover popular inventions, high-resolution reels, and deep-dive technical blogs.'}
              </p>
            </div>

            {/* In-Page Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#16171b',
                border: '1px solid #282932',
                borderRadius: 24,
                padding: '8px 16px',
                marginBottom: 16,
              }}
            >
              <Search size={18} color="#8c8e98" />
              <input
                type="text"
                placeholder="Search across posts, reels, creators, topics, or communities..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 0,
                  outline: 'none',
                  color: '#fff',
                  fontSize: '13.5px',
                  flex: 1,
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams({});
                  }}
                  style={{ background: 'transparent', border: 0, color: '#888', cursor: 'pointer', padding: 0 }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: '#0077e6',
                  border: 0,
                  color: '#fff',
                  borderRadius: 16,
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>

            {/* Content Category Filters (All / Posts / Blogs / Reels / Communities / Creators) */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
              {[
                { id: 'all', label: 'All Content' },
                { id: 'post', label: 'Posts' },
                { id: 'blog', label: 'Blogs' },
                { id: 'reel', label: 'Reels' },
                { id: 'community', label: 'Communities' },
                { id: 'creator', label: 'Creators' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setContentFilter(f.id as any);
                    triggerPulse();
                  }}
                  className={`search-nav-pill ${contentFilter === f.id ? 'active' : ''}`}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Popular Topic Tag Chips */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 20 }}>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedTag(tag);
                    triggerPulse();
                  }}
                  style={{
                    background: selectedTag === tag ? '#00253d' : '#191a20',
                    border: selectedTag === tag ? '1px solid #00a8ed' : '1px solid #272832',
                    color: selectedTag === tag ? '#38bdf8' : '#9ea0aa',
                    borderRadius: 14,
                    padding: '4px 11px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag === 'All' ? 'All Topics' : `#${tag}`}
                </button>
              ))}
            </div>

            {/* Matched Communities Section (if any match query) */}
            {filteredCommunities.length > 0 && (contentFilter === 'all' || contentFilter === 'community') && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '14px', color: '#00a8ed', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={15} />
                  <span>Matching Communities ({filteredCommunities.length})</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                  {filteredCommunities.map((c) => (
                    <Link
                      key={c.id}
                      to={`/communities?comm=${c.id}`}
                      style={{
                        background: '#15161a',
                        border: '1px solid #272832',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                      }}
                    >
                      <img src={c.avatar} alt={c.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ color: '#fff', fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </b>
                        <small style={{ color: '#8e8e98' }}>{c.members}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Creators Section (if any match query) */}
            {filteredCreators.length > 0 && (contentFilter === 'all' || contentFilter === 'creator') && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '14px', color: '#10b981', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={15} />
                  <span>Matching Creators ({filteredCreators.length})</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {filteredCreators.map((creator) => (
                    <div
                      key={creator.id}
                      style={{
                        background: '#15161a',
                        border: '1px solid #272832',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <img src={creator.avatar_url} alt={creator.display_name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ color: '#fff', fontSize: '13px', display: 'block' }}>{creator.display_name}</b>
                        <small style={{ color: creator.themeColor }}>{creator.role}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Reels Track (if reel filter or all) */}
            {filteredReels.length > 0 && (contentFilter === 'all' || contentFilter === 'reel') && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '14px', color: '#f43f5e', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Play size={15} />
                  <span>Matching Reels ({filteredReels.length})</span>
                </h3>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                  {filteredReels.map((reel) => (
                    <Link
                      to="/feed"
                      key={reel.id}
                      style={{
                        width: 140,
                        height: 220,
                        borderRadius: 12,
                        backgroundImage: `url(${reel.poster_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        flexShrink: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: 10,
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <b style={{ color: '#fff', fontSize: '12px', display: 'block', lineHeight: 1.2 }}>{reel.title}</b>
                        <small style={{ color: '#d1d5db', fontSize: '10px' }}>@{reel.creator?.username}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Posts Grid */}
            {(contentFilter === 'all' || contentFilter === 'post' || contentFilter === 'blog') && (
              <div>
                <h3 style={{ fontSize: '14px', color: '#c9cad0', margin: '0 0 12px 0' }}>
                  {filteredPosts.length > 0
                    ? `Posts & Blogs (${filteredPosts.length})`
                    : 'No matching posts or blogs found'}
                </h3>
                {filteredPosts.length > 0 ? (
                  <div className="discover-grid">
                    {filteredPosts.map((post) => (
                      <MediaCard post={post} key={post.id} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                    <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '14px' }}>No content matching "{q || selectedTag}". Try another query or clear the filter.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default SearchPage;
