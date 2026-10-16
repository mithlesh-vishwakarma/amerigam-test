'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Clapperboard, Compass, Globe2, Home, LogIn, MessageCircle, PlusSquare, Search, Settings, Trophy, UsersRound } from 'lucide-react';

const nav = [
  ['Home', '/home', Home], ['Feed', '/feed', Clapperboard], ['Explore', '/search', Compass], ['Competitions', '/competitions', Trophy], ['Create', '/create', PlusSquare], ['Messages', '/messages', MessageCircle], ['Notification', '/notifications', Bell],
] as const;
export function AppShell({ children, right = true }: { children: React.ReactNode; right?: boolean }) {
  const path = usePathname(); const router = useRouter();
  return <div className="app-shell"><header className="topbar"><Link className="brand" href="/home"><span className="brand-mark">A</span>Amerigam</Link><div className="search-wrap"><Search size={20}/><input aria-label="Search posts" placeholder="Search" onKeyDown={e => { if (e.key === 'Enter') router.push('/search?q=' + encodeURIComponent(e.currentTarget.value)); }}/></div><div className="top-actions"><UsersRound/><Globe2/><Bell/><Link aria-label="Sign in" href="/auth"><LogIn/></Link><Settings/></div></header><div className="app-body"><aside className="left-nav"><nav>{nav.map(([label, href, I]) => <Link className={path === href ? 'active' : ''} href={href} key={href}><I size={22}/><span>{label}</span></Link>)}</nav><Link className="nav-setting" href="/settings"><Settings size={22}/>Setting</Link></aside><main className="main-content">{children}</main>{right && <RightRail/>}</div><nav className="mobile-nav">{nav.slice(0, 6).map(([label, href, I]) => <Link href={href} aria-label={label} key={href}><I size={21}/></Link>)}</nav></div>;
}
function RightRail() { return <aside className="right-rail"><section className="profile-box"><div className="profile-summary"><div className="gradient-avatar"/><div><b>Editor</b><div className="stats"><span><strong>11</strong><small>Rank</small></span><span><strong>1001</strong><small>AP</small></span><span><strong>9.3</strong><small>Rating</small></span></div></div></div><small>Your Communities</small><div className="community-bubbles"><i/><i/><i/><i/><i/></div></section><section className="friend-box"><small>Active Friends</small>{['Aarav · Editor', 'Riya · Designer', 'Neel · Filmmaker'].map((friend, i) => <div className="friend" key={friend}><img src={`https://images.unsplash.com/photo-${i === 1 ? '1494790108377-be9c29b29330' : '1534528741775-53994a69daeb'}?auto=format&fit=crop&w=80&q=75`} alt=""/><span>{friend}</span></div>)}</section></aside> }
