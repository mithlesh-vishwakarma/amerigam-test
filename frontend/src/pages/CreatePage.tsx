import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit3,
  Globe,
  Grid,
  FileText,
  Film,
  Sparkles,
  MapPin,
  UserRoundPlus,
  User,
  Smile,
  X,
  Plus,
  Check,
  Ban,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/app-shell';
import { contentStore } from '@/lib/content-store';
import { getCurrentUser } from '@/lib/user-profiles';
import { uploadMediaFile, createPostApi, createStoryApi } from '@/lib/api';
import type { ContentKind } from '@/lib/types';

interface CreatePageProps {
  defaultKind?: ContentKind;
}

const EMOJI_LIST = ['😊', '🔥', '✨', '🎬', '📸', '🚀', '❤️', '🎨', '⚡', '🙌', '💯', '🎧'];

const POPULAR_LOCATIONS = [
  'Tokyo, Japan',
  'Los Angeles, CA',
  'London, United Kingdom',
  'New York, NY',
  'Paris, France',
  'Mumbai, India',
  'Berlin, Germany',
  'Sydney, Australia',
];

const SUGGESTED_COLLABORATORS = [
  { username: 'aarav.edits', name: 'Aarav Edits', role: 'Editor' },
  { username: 'neel.films', name: 'Neel Films', role: 'Cinematographer' },
  { username: 'isha.creates', name: 'Isha Creates', role: 'Artist' },
  { username: 'dev.audio', name: 'Dev Audio', role: 'Sound Designer' },
];

export function CreatePage({ defaultKind }: CreatePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialKind = (searchParams.get('type') as ContentKind) || defaultKind || 'post';

  const [kind, setKind] = useState<ContentKind>(initialKind);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Form Fields matching screenshot
  const [title, setTitle] = useState(initialKind === 'reel' ? 'Concert 1' : initialKind === 'blog' ? 'Film Grading & Emulation' : 'Concert 1');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Advance Setup state
  const [location, setLocation] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [showCollaboratorPicker, setShowCollaboratorPicker] = useState(false);
  const [aiLabel, setAiLabel] = useState(false);
  const [hideStats, setHideStats] = useState(false);

  // Tag people state
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Story-specific styling
  const [storyTextOverlay, setStoryTextOverlay] = useState('');
  const [storyFilter, setStoryFilter] = useState('none');

  // UI state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Update kind when URL param changes
  useEffect(() => {
    const type = searchParams.get('type') as ContentKind;
    if (type && ['post', 'reel', 'blog', 'story'].includes(type)) {
      setKind(type);
    }
  }, [searchParams]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (kind === 'reel' && !selected.type.startsWith('video/')) {
      return setError('Reels require an MP4 or WebM video file.');
    }

    if (selected.size > 50 * 1024 * 1024) {
      return setError('File size must be under 50 MB.');
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  };

  // Sample presets for instant testing
  const loadDemoMedia = (type: 'video' | 'image') => {
    if (type === 'video') {
      setPreview('/media/reel-1.mp4');
      setFile(null);
    } else {
      setPreview('https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80');
      setFile(null);
    }
    setError('');
  };

  const handlePublish = async () => {
    if (!title.trim() && kind !== 'story') {
      return setError('Title is required.');
    }

    if (kind === 'reel' && !preview && !file) {
      return setError('A reel requires a video. Upload one or choose sample video.');
    }

    setBusy(true);
    setError('');

    try {
      const activeUser = getCurrentUser();
      let uploadedUrl = preview;

      // If user uploaded a physical file from device, send to /api/upload
      if (file) {
        setToastMessage('Uploading media file...');
        try {
          const uploadRes = await uploadMediaFile(file);
          uploadedUrl = uploadRes.url;
        } catch (uploadErr: any) {
          console.warn('Backend file upload warning:', uploadErr);
          // Keep preview URL as fallback if backend is unreachable
        }
      }

      if (kind === 'story') {
        // STRICT REQUIREMENT: Posts ONLY to Stories, NOT to Feed!
        const mediaUrl = uploadedUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80';
        const isVideo = mediaUrl.endsWith('.mp4') || file?.type.startsWith('video/');

        // Save to Database
        try {
          await createStoryApi({
            author_id: activeUser.id,
            media_url: mediaUrl,
            media_type: isVideo ? 'video' : 'image',
            caption: description || title,
            text_overlay: storyTextOverlay,
            filter: storyFilter,
          });
        } catch (dbErr) {
          console.warn('Database story save warning:', dbErr);
        }

        contentStore.addStory({
          media_url: mediaUrl,
          media_type: isVideo ? 'video' : 'image',
          caption: description || title,
          text_overlay: storyTextOverlay,
          filter: storyFilter,
        });

        setToastMessage('Story published to your 24h stories!');
        setTimeout(() => {
          navigate('/home');
        }, 600);
      } else if (kind === 'reel') {
        // STRICT REQUIREMENT: Posts to Reels Section!
        const videoUrl = uploadedUrl || '/media/reel-1.mp4';

        // Save to Database
        try {
          await createPostApi({
            author_id: activeUser.id,
            title,
            description: description || 'Cinematic reel breakdown on Amerigam.',
            kind: 'reel',
            media_urls: [videoUrl],
            poster_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
            location,
            collaborators,
            is_ai_labeled: aiLabel,
            hide_stats: hideStats,
          });
        } catch (dbErr) {
          console.warn('Database reel save warning:', dbErr);
        }

        contentStore.addReel({
          title,
          description: description || 'Cinematic reel breakdown on Amerigam.',
          video_url: videoUrl,
          poster_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
          location,
          collaborators,
          is_ai_labeled: aiLabel,
          hide_stats: hideStats,
        });

        setToastMessage('Reel published to the Reels section!');
        setTimeout(() => {
          navigate('/feed');
        }, 600);
      } else {
        // Post or Blog: Posts to Feed
        const mediaUrls = uploadedUrl
          ? [uploadedUrl]
          : kind === 'blog'
          ? ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80']
          : ['https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80'];

        // Save to Database
        try {
          await createPostApi({
            author_id: activeUser.id,
            title,
            description,
            kind: kind === 'blog' ? 'blog' : 'post',
            media_urls: mediaUrls,
            location,
            collaborators,
            is_ai_labeled: aiLabel,
            hide_stats: hideStats,
          });
        } catch (dbErr) {
          console.warn('Database post save warning:', dbErr);
        }

        contentStore.addPost({
          title,
          description,
          kind: kind === 'blog' ? 'blog' : 'post',
          media_urls: mediaUrls,
          location,
          collaborators,
          is_ai_labeled: aiLabel,
          hide_stats: hideStats,
        });

        setToastMessage(`${kind === 'blog' ? 'Blog' : 'Post'} published to Feed!`);
        setTimeout(() => {
          navigate('/home');
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to publish. Navigating to home.');
      setTimeout(() => navigate('/home'), 800);
    } finally {
      setBusy(false);
    }
  };

  // Get current kind badge details
  const getKindInfo = () => {
    switch (kind) {
      case 'blog':
        return { label: 'Blog', icon: FileText, desc: 'Long-form editorial & guides' };
      case 'reel':
        return { label: 'Reel', icon: Film, desc: 'Short vertical cinematic video' };
      case 'story':
        return { label: 'Story', icon: Sparkles, desc: '24h story only (never on feed)' };
      case 'post':
      default:
        return { label: 'Post', icon: Grid, desc: 'Standard feed photo or media' };
    }
  };

  const currentKindInfo = getKindInfo();
  const KindIcon = currentKindInfo.icon;

  const isVideo = file?.type.startsWith('video/') || (preview && preview.endsWith('.mp4'));

  return (
    <AppShell right={false}>
      <section className="create-page-container">
        {/* Toast alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="create-toast-notification"
            >
              <CheckCircle2 size={18} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header Title */}
        <div className="create-page-top-header">
          <h1 className="create-page-title">Create</h1>
        </div>

        {/* Main Composer Box */}
        <div className="create-modal-card">
          {/* Card Top Action Bar */}
          <div className="create-card-header">
            <button
              type="button"
              className="create-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>

            <div className="create-header-right-actions">
              {/* Kind Dropdown Selector (Blog / Post / Reel / Story) */}
              <div className="create-kind-dropdown-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="create-kind-trigger-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <KindIcon size={18} strokeWidth={2} className="kind-trigger-icon" />
                  <span className="kind-trigger-label">{currentKindInfo.label}</span>
                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className={`kind-chevron ${dropdownOpen ? 'rotate' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="create-kind-menu">
                    <button
                      type="button"
                      className={`kind-menu-item ${kind === 'post' ? 'active' : ''}`}
                      onClick={() => {
                        setKind('post');
                        setDropdownOpen(false);
                      }}
                    >
                      <Grid size={18} />
                      <div>
                        <strong>Post</strong>
                        <small>Photos & media to the home feed</small>
                      </div>
                      {kind === 'post' && <Check size={16} className="item-check" />}
                    </button>

                    <button
                      type="button"
                      className={`kind-menu-item ${kind === 'reel' ? 'active' : ''}`}
                      onClick={() => {
                        setKind('reel');
                        setDropdownOpen(false);
                      }}
                    >
                      <Film size={18} />
                      <div>
                        <strong>Reel</strong>
                        <small>Vertical video to the Reels section</small>
                      </div>
                      {kind === 'reel' && <Check size={16} className="item-check" />}
                    </button>

                    <button
                      type="button"
                      className={`kind-menu-item ${kind === 'blog' ? 'active' : ''}`}
                      onClick={() => {
                        setKind('blog');
                        setDropdownOpen(false);
                      }}
                    >
                      <FileText size={18} />
                      <div>
                        <strong>Blog</strong>
                        <small>Articles, stories & community journals</small>
                      </div>
                      {kind === 'blog' && <Check size={16} className="item-check" />}
                    </button>

                    <div className="kind-menu-divider" />

                    <button
                      type="button"
                      className={`kind-menu-item story-kind-item ${kind === 'story' ? 'active' : ''}`}
                      onClick={() => {
                        setKind('story');
                        setDropdownOpen(false);
                      }}
                    >
                      <Sparkles size={18} />
                      <div>
                        <strong>Story</strong>
                        <small>24h visual story (not added to feed)</small>
                      </div>
                      {kind === 'story' && <Check size={16} className="item-check" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Next / Submit Circular Blue Button */}
              <button
                type="button"
                className="create-publish-blue-btn"
                onClick={handlePublish}
                disabled={busy}
                title={`Publish ${currentKindInfo.label}`}
                aria-label="Publish post"
              >
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Body: Two Column Layout */}
          <div className="create-card-grid">
            {/* Left Column: Media Upload & Preview Card */}
            <div className="create-media-column">
              <div
                className={`create-media-card ${kind === 'blog' && !preview ? 'is-blog-empty' : ''}`}
                onClick={() => {
                  if (!preview && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                {/* Top-Right Edit Button */}
                <button
                  type="button"
                  className="create-media-edit-btn"
                  title="Replace media"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  aria-label="Replace media"
                >
                  <Edit3 size={16} strokeWidth={2} />
                </button>

                {/* Media Content or Empty State */}
                {preview ? (
                  <div className="media-preview-container">
                    {isVideo ? (
                      <video
                        src={preview}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="preview-asset"
                      />
                    ) : (
                      <img src={preview} alt="Post preview" className="preview-asset" />
                    )}

                    {/* Story Text Overlay preview */}
                    {kind === 'story' && storyTextOverlay && (
                      <div className="story-canvas-overlay-text">
                        {storyTextOverlay}
                      </div>
                    )}
                  </div>
                ) : kind === 'blog' ? (
                  /* Blog Empty State: Circle with diagonal slash matching reference screenshot 1 */
                  <div className="blog-empty-state-wrap">
                    <div className="blog-slash-circle-icon">
                      <Ban size={72} strokeWidth={1.2} />
                    </div>
                    <p className="blog-empty-caption">
                      Click edit icon to attach optional cover image
                    </p>
                  </div>
                ) : (
                  /* Post / Reel Empty State: Plus icon & 'Select post from computer' matching screenshot 2 & 3 */
                  <div className="media-empty-state-wrap">
                    <div className="empty-plus-icon">
                      <Plus size={44} strokeWidth={1.4} />
                    </div>
                    <span className="empty-state-title">
                      {kind === 'reel' ? 'Select post from computer' : 'Select post from computer'}
                    </span>
                    <small className="empty-state-sub">
                      {kind === 'reel' ? 'Supports MP4, WebM (up to 50MB)' : 'Supports JPG, PNG, WebP, MP4'}
                    </small>

                    {/* Demo Media Quick Buttons */}
                    <div className="demo-preset-row" onClick={(e) => e.stopPropagation()}>
                      {kind === 'reel' ? (
                        <button
                          type="button"
                          className="demo-preset-btn"
                          onClick={() => loadDemoMedia('video')}
                        >
                          Use Sample Reel Video
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="demo-preset-btn"
                            onClick={() => loadDemoMedia('image')}
                          >
                            Sample Photo
                          </button>
                          <button
                            type="button"
                            className="demo-preset-btn"
                            onClick={() => loadDemoMedia('video')}
                          >
                            Sample Video
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Left Pill Button: Tag People matching screenshots */}
                <div className="media-bottom-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={`tag-people-pill ${taggedPeople.length ? 'has-tags' : ''}`}
                    onClick={() => setShowTagModal(!showTagModal)}
                  >
                    <User size={15} strokeWidth={2} />
                    <span>
                      {taggedPeople.length
                        ? `${taggedPeople.length} Tagged`
                        : 'Tag People'}
                    </span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    kind === 'reel'
                      ? 'video/mp4,video/webm'
                      : 'image/jpeg,image/png,image/webp,video/mp4,video/webm'
                  }
                  style={{ display: 'none' }}
                />
              </div>

              {/* Tag People Popover / Selector */}
              {showTagModal && (
                <div className="tag-people-popover">
                  <div className="popover-header">
                    <strong>Tag Creators & Friends</strong>
                    <button type="button" onClick={() => setShowTagModal(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="popover-list">
                    {SUGGESTED_COLLABORATORS.map((c) => {
                      const isTagged = taggedPeople.includes(c.username);
                      return (
                        <button
                          key={c.username}
                          type="button"
                          className={`popover-item ${isTagged ? 'selected' : ''}`}
                          onClick={() => {
                            if (isTagged) {
                              setTaggedPeople(taggedPeople.filter((u) => u !== c.username));
                            } else {
                              setTaggedPeople([...taggedPeople, c.username]);
                            }
                          }}
                        >
                          <span>@{c.username}</span>
                          {isTagged ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Details & Advance setup */}
            <div className="create-details-column">
              {/* 1. Details Box */}
              <div className="composer-details-section">
                <h2 className="section-heading">Details</h2>

                {/* Title (required) Box */}
                <div className="field-box title-field-box">
                  <span className="field-top-label">Title (required)</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                    placeholder={kind === 'story' ? 'Story title (optional)' : 'Concert 1'}
                    className="details-text-input"
                  />
                  <span className="field-counter">{title.length}/100</span>
                </div>

                {/* Description Box with Emoji & Counter */}
                <div className="field-box description-field-box">
                  <span className="field-top-label">Description</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                    placeholder={
                      kind === 'reel'
                        ? 'Share information about Reels to Audiences'
                        : kind === 'blog'
                        ? 'Write detailed article description, insights, or backstory...'
                        : kind === 'story'
                        ? 'Add a caption for your 24-hour story...'
                        : 'Share information about your post to audiences'
                    }
                    className="details-textarea-input"
                  />

                  {/* Bottom toolbar inside Description box */}
                  <div className="field-bottom-bar">
                    <div className="emoji-trigger-wrap">
                      <button
                        type="button"
                        className="emoji-btn"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        aria-label="Add emoji"
                      >
                        <Smile size={18} strokeWidth={1.8} />
                      </button>

                      {showEmojiPicker && (
                        <div className="quick-emoji-bar">
                          {EMOJI_LIST.map((emo) => (
                            <button
                              key={emo}
                              type="button"
                              className="quick-emoji-btn"
                              onClick={() => {
                                setDescription((prev) => (prev + emo).slice(0, 2000));
                                setShowEmojiPicker(false);
                              }}
                            >
                              {emo}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="field-counter">{description.length}/2000</span>
                  </div>
                </div>

                {/* Story Specific Customizer (when in story mode) */}
                {kind === 'story' && (
                  <div className="story-customizer-box">
                    <span className="field-top-label">Story Text Overlay</span>
                    <input
                      type="text"
                      value={storyTextOverlay}
                      onChange={(e) => setStoryTextOverlay(e.target.value)}
                      placeholder="Type text to overlay on story..."
                      className="details-text-input"
                      maxLength={60}
                    />
                    <small className="story-destination-notice">
                      <Sparkles size={13} />
                      This will be posted to your <strong>Stories</strong> only (not in feed).
                    </small>
                  </div>
                )}
              </div>

              {/* 2. Advance setup Box */}
              <div className="composer-advance-section">
                <h3 className="section-heading">Advance setup</h3>

                <div className="advance-setup-card">
                  {/* Row 1: Add location */}
                  <div
                    className="advance-row clickable"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                  >
                    <div className="advance-row-left">
                      <span className="advance-row-title">
                        {location ? `Location: ${location}` : 'Add location'}
                      </span>
                    </div>
                    <MapPin size={18} className="advance-icon" />
                  </div>

                  {showLocationPicker && (
                    <div className="advance-picker-dropdown">
                      {POPULAR_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className={`advance-picker-option ${location === loc ? 'active' : ''}`}
                          onClick={() => {
                            setLocation(loc);
                            setShowLocationPicker(false);
                          }}
                        >
                          <MapPin size={13} />
                          <span>{loc}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Row 2: Add collaborators */}
                  <div
                    className="advance-row clickable"
                    onClick={() => setShowCollaboratorPicker(!showCollaboratorPicker)}
                  >
                    <div className="advance-row-left">
                      <span className="advance-row-title">
                        {collaborators.length
                          ? `Collaborators: ${collaborators.join(', ')}`
                          : 'Add collaborators'}
                      </span>
                    </div>
                    <UserRoundPlus size={18} className="advance-icon" />
                  </div>

                  {showCollaboratorPicker && (
                    <div className="advance-picker-dropdown">
                      {SUGGESTED_COLLABORATORS.map((collab) => {
                        const isSelected = collaborators.includes(collab.username);
                        return (
                          <button
                            key={collab.username}
                            type="button"
                            className={`advance-picker-option ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setCollaborators(collaborators.filter((c) => c !== collab.username));
                              } else {
                                setCollaborators([...collaborators, collab.username]);
                              }
                            }}
                          >
                            <span>@{collab.username} ({collab.name})</span>
                            {isSelected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Row 3: Add AI label */}
                  <div className="advance-row toggle-row">
                    <div className="advance-row-left">
                      <span className="advance-row-title">Add AI label</span>
                      <p className="advance-row-desc">
                        We require you to label certain realistic content that's made with AI.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`ios-toggle-btn ${aiLabel ? 'checked' : ''}`}
                      onClick={() => setAiLabel(!aiLabel)}
                      role="switch"
                      aria-checked={aiLabel}
                      aria-label="Toggle AI label"
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>

                  {/* Row 4: Hide like and view counts on this post */}
                  <div className="advance-row toggle-row">
                    <div className="advance-row-left">
                      <span className="advance-row-title">
                        Hide like and view counts on this post
                      </span>
                      <p className="advance-row-desc">
                        Only you will see the total number of likes and views on this post. You can
                        change this later by going to the ••• menu at the top of the post. To hide like
                        counts on other people's posts, go to your account settings.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`ios-toggle-btn ${hideStats ? 'checked' : ''}`}
                      onClick={() => setHideStats(!hideStats)}
                      role="switch"
                      aria-checked={hideStats}
                      aria-label="Toggle hide like and view counts"
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                </div>

                {error && <p className="create-error-msg">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default CreatePage;
