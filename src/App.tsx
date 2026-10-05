/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Download, Star, ShieldCheck, Flame, Zap, Trophy, Bookmark, 
  Gamepad2, Sparkles, CheckCircle2, ChevronRight, RotateCcw, FileDown
} from 'lucide-react';
import { GameItem, ActiveDownload, DownloadStatus, GameReview } from './types/store';
import { STORE_GAMES, GGO_FOOTBALL_GAME } from './data/games';
import { PlayStoreHeader } from './components/PlayStoreHeader';
import { PlayStoreNav, MainCategory, SubCategory } from './components/PlayStoreNav';
import { GameCard } from './components/GameCard';
import { GameDetailPage } from './components/GameDetailPage';
import { DownloadManagerModal } from './components/DownloadManagerModal';
import { GGOFootballGame } from './game/GGOFootballGame';
import { sounds } from './game/sound';

export default function App() {
  // Store navigation & views
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mainCategory, setMainCategory] = useState<MainCategory>('games');
  const [subCategory, setSubCategory] = useState<SubCategory>('for_you');
  const [activeTab, setActiveTab] = useState<'browse' | 'library' | 'downloads'>('browse');
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  // Catalog
  const [games, setGames] = useState<GameItem[]>(STORE_GAMES);

  // Installed games state (with localStorage persistence)
  const [installedGameIds, setInstalledGameIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ggo_playstore_installed');
      return saved ? JSON.parse(saved) : ['ggo-football']; // Pre-installed or ready to install
    } catch {
      return ['ggo-football'];
    }
  });

  // Active downloads
  const [activeDownloads, setActiveDownloads] = useState<ActiveDownload[]>([]);

  // Persist installed games
  useEffect(() => {
    try {
      localStorage.setItem('ggo_playstore_installed', JSON.stringify(installedGameIds));
    } catch {
      // ignore
    }
  }, [installedGameIds]);

  // Handle download simulation
  const startDownload = (game: GameItem) => {
    if (installedGameIds.includes(game.id)) return;
    if (activeDownloads.some((d) => d.gameId === game.id)) return;

    sounds.playClick();
    const newDownload: ActiveDownload = {
      gameId: game.id,
      progress: 5,
      downloadedMB: 3.2,
      totalMB: game.sizeMB,
      speedMBs: 14.8,
      status: 'downloading',
    };

    setActiveDownloads((prev) => [...prev, newDownload]);

    const interval = setInterval(() => {
      setActiveDownloads((current) => {
        const item = current.find((d) => d.gameId === game.id);
        if (!item) {
          clearInterval(interval);
          return current;
        }

        const nextProgress = item.progress + 15;
        if (nextProgress >= 100) {
          clearInterval(interval);
          // Mark as installed
          setInstalledGameIds((inst) => [...new Set([...inst, game.id])]);
          sounds.playGoal();
          return current.filter((d) => d.gameId !== game.id);
        }

        const nextStatus: DownloadStatus = nextProgress >= 90 ? 'verifying' : 'downloading';
        const downloadedMB = (nextProgress / 100) * game.sizeMB;

        return current.map((d) =>
          d.gameId === game.id
            ? { ...d, progress: nextProgress, downloadedMB, status: nextStatus }
            : d
        );
      });
    }, 350);
  };

  const cancelDownload = (gameId: string) => {
    setActiveDownloads((prev) => prev.filter((d) => d.gameId !== gameId));
  };

  const uninstallGame = (gameId: string) => {
    setInstalledGameIds((prev) => prev.filter((id) => id !== gameId));
    sounds.playClick();
  };

  const handleLaunchGame = (game: GameItem) => {
    if (!installedGameIds.includes(game.id)) {
      startDownload(game);
      return;
    }
    // Launch game
    setIsPlaying(true);
    sounds.playWhistle(true);
  };

  const handleAddReview = (gameId: string, review: GameReview) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, reviews: [review, ...g.reviews] } : g))
    );
  };

  // Filtered games based on search and subcategories
  const filteredGames = useMemo(() => {
    let list = games;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    } else {
      if (subCategory === 'sports') {
        list = list.filter((g) => g.genre === 'Sports');
      } else if (subCategory === 'action') {
        list = list.filter((g) => g.category.includes('Action') || g.id === 'ggo-football');
      }
    }
    return list;
  }, [games, searchQuery, subCategory]);

  const ggoGame = games.find((g) => g.id === 'ggo-football') || GGO_FOOTBALL_GAME;
  const isGGOInstalled = installedGameIds.includes('ggo-football');
  const ggoDownload = activeDownloads.find((d) => d.gameId === 'ggo-football');
  const ggoDownloadStatus: DownloadStatus = isGGOInstalled
    ? 'installed'
    : ggoDownload
    ? ggoDownload.status
    : 'idle';

  // If user is currently playing the game, render the full immersive GGO Football engine!
  if (isPlaying) {
    return (
      <GGOFootballGame
        onExit={() => setIsPlaying(false)}
        tournamentMode={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-[#e3e3e3] font-sans flex flex-col">
      {/* Google Play Store Top Bar */}
      <PlayStoreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeDownloadsCount={activeDownloads.length}
        onOpenDownloads={() => setShowDownloadModal(true)}
        onNavigateHome={() => {
          setSelectedGame(null);
          setActiveTab('browse');
          setSearchQuery('');
        }}
      />

      {/* Categories & Subtabs */}
      <PlayStoreNav
        mainCategory={mainCategory}
        onSelectMainCategory={setMainCategory}
        subCategory={subCategory}
        onSelectSubCategory={setSubCategory}
        activeTab={activeTab}
        onSelectActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-16">
        {selectedGame ? (
          /* Game Detail Page */
          <GameDetailPage
            game={selectedGame}
            downloadStatus={
              installedGameIds.includes(selectedGame.id)
                ? 'installed'
                : activeDownloads.find((d) => d.gameId === selectedGame.id)
                ? activeDownloads.find((d) => d.gameId === selectedGame.id)!.status
                : 'idle'
            }
            activeDownload={activeDownloads.find((d) => d.gameId === selectedGame.id)}
            onBack={() => setSelectedGame(null)}
            onInstall={startDownload}
            onCancelDownload={cancelDownload}
            onUninstall={uninstallGame}
            onPlay={handleLaunchGame}
            onAddReview={handleAddReview}
          />
        ) : activeTab === 'library' ? (
          /* My Library & Installed Games */
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Installed Games & Apps</h1>
                <p className="text-xs text-slate-400">Games ready for immediate offline play on this device</p>
              </div>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="px-3.5 py-1.5 bg-[#2c2c2c] hover:bg-[#343434] text-xs font-semibold rounded-lg text-emerald-400 border border-emerald-900/40"
              >
                Manage Storage
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games
                .filter((g) => installedGameIds.includes(g.id))
                .map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    downloadStatus="installed"
                    onSelect={(g) => setSelectedGame(g)}
                    onQuickPlay={handleLaunchGame}
                  />
                ))}
            </div>

            {installedGameIds.length === 0 && (
              <div className="text-center py-16 bg-[#252525] rounded-2xl border border-dashed border-[#3a3a3a]">
                <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No games installed</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Install GGO Football to play real robot soccer!</p>
                <button
                  onClick={() => startDownload(GGO_FOOTBALL_GAME)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Install GGO Football
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Store Home / Catalog View */
          <div className="px-4 py-6 space-y-8">
            {/* Big Featured Hero Spotlight: GGO FOOTBALL */}
            {!searchQuery && (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#142318] via-[#101b13] to-[#0a110d] border border-[#23422c] p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left Hero Details */}
                <div className="max-w-xl z-10">
                  {/* Subtle Unboxed Editorial Tag */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>FEATURED GAME OF THE MONTH</span>
                    <span aria-hidden="true" className="text-emerald-900">·</span>
                    <span className="text-slate-400">#1 Top Free in Sports</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    GGO FOOTBALL
                  </h1>
                  <p className="text-sm sm:text-base text-emerald-200/90 font-medium mt-1">
                    AI Robo League · Season 2
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                    Lead Myth and Isaac's robotic squad in electrifying 5v5 soccer showdowns! Execute the legendary <strong className="text-amber-300">Roaring Flame Shot</strong>, crack opponent defenses, and conquer the World Tournament Cup.
                  </p>

                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-4">
                    <span className="flex items-center gap-1 text-white font-bold">
                      <span>4.8</span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>100M+ Downloads</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>64 MB</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>Offline Playable</span>
                  </div>

                  {/* Hero CTAs */}
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    {ggoDownloadStatus === 'installed' ? (
                      <button
                        onClick={() => handleLaunchGame(ggoGame)}
                        className="px-8 py-3 bg-[#00875a] hover:bg-[#00a36c] active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Play Game Now</span>
                      </button>
                    ) : ggoDownloadStatus === 'downloading' ? (
                      <div className="flex items-center gap-3 bg-[#1e3425] px-5 py-2.5 rounded-xl border border-emerald-700/50">
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                        <span className="text-xs font-bold text-white">
                          Downloading {ggoDownload?.progress}%...
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => startDownload(ggoGame)}
                        className="px-8 py-3 bg-[#00875a] hover:bg-[#00a36c] active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Game (64 MB)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedGame(ggoGame);
                        sounds.playClick();
                      }}
                      className="px-5 py-3 bg-[#243528] hover:bg-[#2e4534] text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-colors border border-emerald-900/60"
                    >
                      View Details & Reviews
                    </button>
                  </div>
                </div>

                {/* Right Hero Visual Banner */}
                <div
                  onClick={() => {
                    setSelectedGame(ggoGame);
                    sounds.playClick();
                  }}
                  className="w-full lg:w-96 rounded-2xl overflow-hidden aspect-video bg-[#0b140e] border border-emerald-600/40 shadow-2xl relative group cursor-pointer"
                >
                  <img
                    src={ggoGame.bannerUrl}
                    alt="GGO Football Spotlight"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                      <span>Roaring Flame Shot EX Gameplay</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular & Top Free Row */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {searchQuery ? `Search results for "${searchQuery}"` : 'Top Charts & Football Games'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Most downloaded high-voltage sports action games
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold cursor-pointer hover:underline">
                  See all
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    downloadStatus={
                      installedGameIds.includes(game.id)
                        ? 'installed'
                        : activeDownloads.find((d) => d.gameId === game.id)
                        ? activeDownloads.find((d) => d.gameId === game.id)!.status
                        : 'idle'
                    }
                    onSelect={(g) => setSelectedGame(g)}
                    onQuickPlay={handleLaunchGame}
                    onQuickInstall={startDownload}
                  />
                ))}
              </div>
            </div>

            {/* Editor's Choice Highlights */}
            <div className="p-6 bg-[#252525] rounded-3xl border border-[#333333]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Editor's Choice: Why We Love GGO Football</h3>
                  <p className="text-xs text-slate-400">Official Play Store Editorial Review</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                "GGO Football captures the heart of competitive anime soccer like nothing else on the store. With ultra-responsive physics, real offline playability, and Myth's thunderous Roaring Flame Shot, it sets the gold standard for robotic sports simulations."
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-[#303030]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Google Play Certified Safe</span>
                </div>
                <span>·</span>
                <span>Optimized for all screen sizes</span>
                <span>·</span>
                <span>Synthesized Web Audio 60 FPS Engine</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Download Manager Modal */}
      {showDownloadModal && (
        <DownloadManagerModal
          activeDownloads={activeDownloads}
          installedGameIds={installedGameIds}
          games={games}
          onClose={() => setShowDownloadModal(false)}
          onPlayGame={handleLaunchGame}
          onUninstallGame={uninstallGame}
          onCancelDownload={cancelDownload}
        />
      )}
    </div>
  );
}
