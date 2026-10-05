import React, { useState } from 'react';
import { Search, Bell, Mic, X, User, Download, CheckCircle2, Moon, Sun, Settings } from 'lucide-react';
import { sounds } from '../game/sound';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeDownloadsCount: number;
  onOpenDownloads: () => void;
  onNavigateHome: () => void;
}

export const PlayStoreHeader: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  activeDownloadsCount,
  onOpenDownloads,
  onNavigateHome,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: 'GGO Football Update',
      desc: 'Version 3.4 is live! Roaring Flame Shot EX & Tournament Cup added.',
      time: '1h ago',
    },
    {
      id: 2,
      title: 'Google Play Points',
      desc: 'You earned 50 Play Points on your last sports achievement!',
      time: '1d ago',
    },
  ]);

  return (
    <header className="sticky top-0 z-40 bg-[#1f1f1f] border-b border-[#303030] text-[#e3e3e3] px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Lockup: Google Play Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 focus:outline-none group text-left cursor-pointer shrink-0"
        >
          {/* Authentic Google Play icon SVG */}
          <div className="w-8 h-8 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
              <path
                d="M5.5 3.5L24.5 20L5.5 36.5C4.7 35.8 4 34.6 4 33.2V6.8C4 5.4 4.7 4.2 5.5 3.5Z"
                fill="#00E676"
              />
              <path
                d="M31.2 14.2L24.5 20L5.5 3.5C6.4 2.6 7.7 2.1 9.2 2.9L31.2 14.2Z"
                fill="#00B0FF"
              />
              <path
                d="M31.2 25.8L9.2 37.1C7.7 37.9 6.4 37.4 5.5 36.5L24.5 20L31.2 25.8Z"
                fill="#FF3D00"
              />
              <path
                d="M36 20C36 20.8 35.5 21.6 34.8 22L31.2 24.1L24.5 20L31.2 15.9L34.8 18C35.5 18.4 36 19.2 36 20Z"
                fill="#FFD600"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            Google Play
          </span>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center bg-[#2c2c2c] hover:bg-[#343434] focus-within:bg-[#343434] rounded-full border border-transparent focus-within:border-emerald-500/70 transition-all px-4 py-2 shadow-inner">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for apps & games, GGO Football..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:text-white text-slate-400 mr-2"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                onSearchChange('GGO Football');
                sounds.playClick();
              }}
              className="text-slate-400 hover:text-emerald-400 transition-colors"
              title="Voice search / quick query"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions Zone: Downloads, Notifications, User Profile */}
        <div className="flex items-center gap-2 relative">
          {/* Active Downloads Button */}
          <button
            onClick={() => {
              onOpenDownloads();
              sounds.playClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#2c2c2c] hover:bg-[#383838] text-slate-200 transition-colors relative"
            title="Download Manager"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Downloads</span>
            {activeDownloadsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-[11px] font-bold flex items-center justify-center animate-pulse">
                {activeDownloadsCount}
              </span>
            )}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 rounded-full hover:bg-[#2c2c2c] text-slate-300 hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-[#282828] border border-[#3e3e3e] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#383838] mb-2 px-1">
                  <span className="text-xs font-bold text-white">Notifications & Updates</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Mark all read</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 bg-[#202020] rounded-xl hover:bg-[#303030] transition-colors cursor-pointer">
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Play Points Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#292929] rounded-full border border-emerald-900/40 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Diamond</span>
            <span className="font-mono text-emerald-300 font-semibold">1,450 pts</span>
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-md ring-2 ring-transparent hover:ring-emerald-500 transition-all"
            >
              K
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#282828] border border-[#3e3e3e] rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center gap-3 pb-3 border-b border-[#3e3e3e] mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex items-center justify-center">
                    K
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">Player King</p>
                    <p className="text-xs text-slate-400 truncate">kingkrish9361@gmail.com</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onOpenDownloads();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#343434] text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>Manage apps & device</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Updates ready</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenDownloads();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#343434] text-slate-200 transition-colors"
                  >
                    Play Pass & Subscriptions
                  </button>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#343434] text-slate-200 transition-colors"
                  >
                    Settings & Family
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
