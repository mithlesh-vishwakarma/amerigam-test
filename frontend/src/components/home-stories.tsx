import React, { useState } from 'react';
import { UserPlus, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const mockStories = [
  {
    id: 'story-1',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    time: '2h ago',
  },
  {
    id: 'story-2',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    time: '5h ago',
  },
];

export function HomeStories() {
  const [following, setFollowing] = useState(false);

  return (
    <section className="stories" aria-label="Stories and friend discovery">
      {/* Add Story Button (Small compact size) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="story-card add-story"
      >
        <span className="story-avatar">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=75"
            alt="Your story"
          />
          <i aria-hidden="true"><Plus size={14} strokeWidth={2.5} /></i>
        </span>
        <b>Add Story</b>
        <small>24h update</small>
      </motion.button>

      {/* Find Friends Card (Small compact size, intact) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className={`story-card find-friends ${following ? 'is-following' : ''}`}
        onClick={() => setFollowing(!following)}
      >
        <span className="friend-icon">
          {following ? <Check size={18} strokeWidth={2.5} /> : <UserPlus size={18} strokeWidth={2} />}
        </span>
        <b>{following ? 'Following' : 'Find Friends'}</b>
        <small>{following ? 'Suggestions ready' : 'Discover creators'}</small>
      </motion.button>

      {/* Sample creator stories */}
      {mockStories.map((story) => (
        <motion.div
          key={story.id}
          whileHover={{ scale: 1.03, y: -2 }}
          className="story-card creator-story"
        >
          <span className="story-avatar has-ring">
            <img src={story.avatar} alt={story.name} />
          </span>
          <b>{story.name}</b>
          <small>{story.time}</small>
        </motion.div>
      ))}
    </section>
  );
}
