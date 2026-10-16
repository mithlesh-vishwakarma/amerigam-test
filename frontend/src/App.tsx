import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TopLoaderProvider } from './components/top-loader';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { SearchPage } from './pages/SearchPage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { CreatePage } from './pages/CreatePage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <TopLoaderProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/explore" element={<SearchPage defaultTab="explore" />} />
        <Route path="/communities" element={<SearchPage defaultTab="communities" />} />
        <Route path="/network" element={<SearchPage defaultTab="network" />} />
        <Route path="/search" element={<SearchPage defaultTab="explore" />} />
        <Route path="/competitions" element={<CompetitionsPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/create/story" element={<CreatePage defaultKind="story" />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </TopLoaderProvider>
  );
}
export default App;
