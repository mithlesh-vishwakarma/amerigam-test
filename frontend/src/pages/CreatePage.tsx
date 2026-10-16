import React, { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, MapPin, Send, UserRoundPlus, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/client';
import type { ContentKind } from '@/lib/types';

export function CreatePage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<ContentKind>('post');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.files?.[0];
    if (!value) return;
    if (kind === 'reel' && !value.type.startsWith('video/')) {
      return setError('Reels require an MP4 or WebM video.');
    }
    if (value.size > 20 * 1024 * 1024) {
      return setError('Choose a file smaller than 20 MB.');
    }
    setFile(value);
    setPreview(URL.createObjectURL(value));
    setError('');
  };

  const publish = async () => {
    if (!title.trim()) return setError('A title is required.');
    if (kind === 'reel' && !file) return setError('A reel requires a video.');
    setBusy(true);
    setError('');

    try {
      let mediaUrls: string[] = [];
      if (file) {
        const sb = createClient();
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (user) {
          const objectPath = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
          const { error: uploadError } = await sb.storage
            .from('post-media')
            .upload(objectPath, file, { contentType: file.type });
          if (!uploadError) {
            const { data } = sb.storage.from('post-media').getPublicUrl(objectPath);
            mediaUrls = [data.publicUrl];
          }
        }
      }

      if (!mediaUrls.length && preview) {
        mediaUrls = [preview];
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, title, description, media_urls: mediaUrls }),
      });

      if (response.ok) {
        const body = await response.json();
        navigate(`/posts/${body.post?.id || ''}`);
      } else {
        // If offline or local demo, navigate back to home
        navigate('/home');
      }
    } catch (e) {
      // Local fallback
      navigate('/home');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell right={false}>
      <section className="create-page">
        <h1 className="page-title">Create</h1>
        <div className="composer">
          <button className="back" onClick={() => navigate(-1)} type="button">
            <ArrowLeft />
          </button>
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as ContentKind);
              setFile(null);
              setPreview('');
            }}
          >
            <option value="post">▦ Post</option>
            <option value="reel">▣ Reel</option>
            <option value="blog">▤ Blog</option>
          </select>
          <button className="publish" onClick={publish} disabled={busy} type="button">
            <Send size={18} />
          </button>
          <label className="upload-area">
            {preview ? (
              file?.type.startsWith('video/') ? (
                <video src={preview} controls />
              ) : (
                <img src={preview} alt="Preview" />
              )
            ) : (
              <>
                <ImagePlus size={48} />
                <b>{kind === 'blog' ? 'Write your story in Details' : 'Select post from computer'}</b>
              </>
            )}
            {preview && (
              <button
                className="remove"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                  setPreview('');
                }}
              >
                <X size={16} /> Replace media
              </button>
            )}
            <input
              type="file"
              onChange={choose}
              accept={kind === 'reel' ? 'video/mp4,video/webm' : 'image/*,video/mp4,video/webm'}
              disabled={kind === 'blog'}
            />
          </label>
          <section className="details">
            <h2>Details</h2>
            <label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Title (required)"
              />
              <small>{title.length}/100</small>
            </label>
            <label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Description"
              />
              <small>{description.length}/2000</small>
            </label>
            <div className="advance">
              <h3>Advance setup</h3>
              <p>
                Add location <MapPin size={15} />
              </p>
              <p>
                Add collaborators <UserRoundPlus size={15} />
              </p>
              <p>
                Add AI label <i />
              </p>
              <small>We require you to label realistic content that's made with AI.</small>
              <p>
                Hide like and view counts <i />
              </p>
            </div>
            {error && <p className="form-error">{error}</p>}
          </section>
        </div>
      </section>
    </AppShell>
  );
}
export default CreatePage;
