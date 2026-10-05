import React from 'react';
import { Gamepad2, LayoutGrid, Search, BookOpen, Download, Bookmark } from 'lucide-react';
import { sounds } from '../game/sound';

export type MainCategory = 'games' | 'apps' | 'books';
export type SubCategory = 'for_you' | 'top_charts' | 'sports' | 'action' | 'premium';

interface Props {
  mainCategory: MainCategory;
  onSelectMainCategory: (cat: MainCategory) => void;
  subCategory: SubCategory;
  onSelectSubCategory: (sub: SubCategory) => void;
  activeTab: 'browse' | 'library' | 'downloads';
  onSelectActiveTab: (tab: 'browse' | 'library' | 'downloads') => void;
}

export const PlayStoreNav: React.FC<Props> = ({
  mainCategory,
  onSelectMainCategory,
  subCategory,
  onSelectSubCategory,
  activeTab,
  onSelectActiveTab,
}) => {
  const subCategories: Array<{ id: SubCategory; label: string }> = [
    { id: 'for_you', label: 'For you' },
    { id: 'top_charts', label: 'Top charts' },
    { id: 'sports', label: 'Sports & Football' },
    { id: 'action', label: 'Robot & Action' },
    { id: 'premium', label: 'Premium' },
  ];

  return (
    <div className="bg-[#1f1f1f] border-b border-[#303030] text-[#c4c7c5]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Categories Row (Games, Apps, Books, Library) */}
        <div className="flex items-center justify-between border-b border-[#2a2a2a] pt-1">
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                onSelectMainCategory('games');
                onSelectActiveTab('browse');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${
                activeTab === 'browse' && mainCategory === 'games'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Games</span>
              {activeTab === 'browse' && mainCategory === 'games' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                onSelectMainCategory('apps');
                onSelectActiveTab('browse');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${
                activeTab === 'browse' && mainCategory === 'apps'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Apps</span>
              {activeTab === 'browse' && mainCategory === 'apps' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                onSelectActiveTab('library');
                sounds.playClick();
              }}
              className={`flex items-center gap-2 pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${
                activeTab === 'library'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>My Library & Installed</span>
              {activeTab === 'library' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center text-xs text-slate-400 gap-2">
            <span>Official Android APK Package Manager</span>
          </div>
        </div>

        {/* Sub-Filters / Sub-tabs */}
        {activeTab === 'browse' && (
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {subCategories.map((sub) => {
              const active = subCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSelectSubCategory(sub.id);
                    sounds.playClick();
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#004d40] text-emerald-200 border border-emerald-500/50'
                      : 'bg-[#2a2a2a] text-slate-300 hover:bg-[#333333]'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
