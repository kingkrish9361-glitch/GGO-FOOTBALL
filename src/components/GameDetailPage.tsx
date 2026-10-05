import React, { useState } from 'react';
import { 
  ArrowLeft, Star, Download, Play, ShieldCheck, Share2, Bookmark, 
  Check, Trash2, Award, ChevronRight, ThumbsUp, Sparkles, FileDown,
  Info, ExternalLink
} from 'lucide-react';
import { GameItem, DownloadStatus, ActiveDownload, GameReview } from '../types/store';
import { ReviewModal } from './ReviewModal';
import { sounds } from '../game/sound';

interface Props {
  game: GameItem;
  downloadStatus: DownloadStatus;
  activeDownload?: ActiveDownload;
  onBack: () => void;
  onInstall: (game: GameItem) => void;
  onCancelDownload: (gameId: string) => void;
  onUninstall: (gameId: string) => void;
  onPlay: (game: GameItem) => void;
  onAddReview: (gameId: string, review: GameReview) => void;
}

export const GameDetailPage: React.FC<Props> = ({
  game,
  downloadStatus,
  activeDownload,
  onBack,
  onInstall,
  onCancelDownload,
  onUninstall,
  onPlay,
  onAddReview,
}) => {
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsList, setReviewsList] = useState<GameReview[]>(game.reviews);
  const [shareToast, setShareToast] = useState(false);

  const handleShare = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handleReviewSubmit = (rev: GameReview) => {
    setReviewsList([rev, ...reviewsList]);
    setShowReviewModal(false);
    onAddReview(game.id, rev);
  };

  // Export offline HTML game
  const handleExportOffline = () => {
    sounds.playClick();
    const offlineHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${game.title} - Official Package</title>
  <style>
    body { background: #070b09; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    h1 { color: #00e676; }
    canvas { border: 2px solid #00e676; border-radius: 12px; }
  </style>
</head>
<body>
  <h1>${game.title}</h1>
  <p>Offline Android Simulation Package</p>
  <p>To enjoy the full interactive experience with high-speed 60FPS physics, play directly in the Google Play web app!</p>
</body>
</html>`;
    const blob = new Blob([offlineHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.shortTitle}_APK_Bundle.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-[#e3e3e3]">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => {
            onBack();
            sounds.playClick();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#2c2c2c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              sounds.playClick();
            }}
            className={`p-2 rounded-full border transition-colors ${
              isWishlisted
                ? 'bg-rose-950/60 border-rose-700 text-rose-400'
                : 'border-[#383838] text-slate-400 hover:text-white hover:bg-[#2c2c2c]'
            }`}
            title="Add to Wishlist"
          >
            <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-[#383838] text-slate-400 hover:text-white hover:bg-[#2c2c2c] transition-colors relative"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
            {shareToast && (
              <span className="absolute -bottom-8 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Listing Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-[#303030]">
        {/* App Icon */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-[#181818] border border-white/10 shrink-0 shadow-xl">
          <img
            src={game.iconUrl}
            alt={game.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {game.title}
          </h1>
          <p className="text-sm font-semibold text-emerald-400 mt-1">{game.developer}</p>
          <p className="text-xs text-slate-400 mt-0.5">Contains ads · In-app purchases</p>

          {/* Key Metrics Row */}
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-[#2a2a2a] text-xs">
            {/* Rating */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 font-bold text-white text-sm">
                <span>{game.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5">{game.reviewCount}</span>
            </div>

            <div className="w-px h-8 bg-[#333333]" />

            {/* Downloads */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">{game.downloads}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Downloads</span>
            </div>

            <div className="w-px h-8 bg-[#333333]" />

            {/* Size */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">{game.size}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Download size</span>
            </div>

            <div className="w-px h-8 bg-[#333333]" />

            {/* Age Rating */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-sm">{game.ageRating}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Content rating</span>
            </div>

            {game.editorChoice && (
              <>
                <div className="w-px h-8 bg-[#333333] hidden sm:block" />
                <div className="hidden sm:flex flex-col items-center">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                    <Award className="w-3.5 h-3.5" />
                    <span>Choice</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">Editors' Choice</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Button Bar */}
      <div className="py-5 border-b border-[#303030]">
        {downloadStatus === 'downloading' && activeDownload ? (
          <div className="bg-[#242424] border border-[#383838] p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <span className="text-xs font-bold text-white">
                  {activeDownload.status === 'verifying'
                    ? 'Verifying and installing AI Engine...'
                    : `Downloading... ${activeDownload.progress}%`}
                </span>
              </div>
              <button
                onClick={() => onCancelDownload(game.id)}
                className="text-xs font-semibold text-slate-400 hover:text-rose-400"
              >
                Cancel
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-[#181818] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                style={{ width: `${activeDownload.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>{activeDownload.downloadedMB.toFixed(1)} MB / {activeDownload.totalMB} MB</span>
              <span>Speed: {activeDownload.speedMBs} MB/s</span>
            </div>
          </div>
        ) : downloadStatus === 'installed' ? (
          <div className="flex flex-wrap items-center gap-3">
            {/* Play Button */}
            <button
              onClick={() => {
                onPlay(game);
                sounds.playClick();
              }}
              className="px-8 py-3 bg-[#00875a] hover:bg-[#00a36c] active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Now</span>
            </button>

            {/* Standalone package export */}
            <button
              onClick={handleExportOffline}
              className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#343434] text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-[#3e3e3e]"
              title="Download APK / Offline file package"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Export Offline File</span>
            </button>

            {/* Uninstall */}
            <button
              onClick={() => onUninstall(game.id)}
              className="px-4 py-3 bg-transparent hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Uninstall</span>
            </button>

            <div className="ml-auto text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified by Play Protect · Ready to Play</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {/* Install Button */}
            <button
              onClick={() => {
                onInstall(game);
                sounds.playClick();
              }}
              className="px-8 py-3 bg-[#00875a] hover:bg-[#00a36c] active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Install ({game.size})</span>
            </button>

            {/* Direct APK Download action */}
            <button
              onClick={handleExportOffline}
              className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#343434] text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-[#3e3e3e]"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Download APK</span>
            </button>

            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
              Instant installation with built-in Web Audio & offline engine
            </span>
          </div>
        )}
      </div>

      {/* Media Screenshots Gallery */}
      <div className="py-6 border-b border-[#303030]">
        <h2 className="text-sm font-bold text-white mb-3">Screenshots & Gameplay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {game.screenshots.map((src, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveScreenshot(src);
                sounds.playClick();
              }}
              className="group relative rounded-xl overflow-hidden aspect-video bg-[#181818] border border-[#353535] cursor-pointer hover:border-emerald-500/70 transition-all shadow-md"
            >
              <img
                src={src}
                alt={`${game.title} screenshot ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* About this game */}
      <div className="py-6 border-b border-[#303030]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">About this game</h2>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {game.description}
        </p>

        {/* Feature bullets */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {game.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* What's new */}
        {game.whatsNew && (
          <div className="mt-5 p-4 bg-[#252525] rounded-xl border border-[#353535]">
            <h3 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>What's new in this version</span>
            </h3>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
              {game.whatsNew}
            </p>
          </div>
        )}
      </div>

      {/* Ratings and Reviews */}
      <div className="py-6 border-b border-[#303030]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Ratings and reviews</h2>
            <p className="text-xs text-slate-400">Ratings are verified and from people who use the same type of device.</p>
          </div>
          <button
            onClick={() => {
              setShowReviewModal(true);
              sounds.playClick();
            }}
            className="px-4 py-2 bg-[#2c2c2c] hover:bg-[#363636] text-emerald-400 hover:text-emerald-300 font-semibold text-xs rounded-xl transition-colors border border-emerald-900/40"
          >
            Write a review
          </button>
        </div>

        {/* Score Overview */}
        <div className="flex items-center gap-8 mb-6 bg-[#252525] p-5 rounded-2xl border border-[#353535]">
          <div className="text-center">
            <span className="text-4xl font-black text-white">{game.rating.toFixed(1)}</span>
            <div className="flex items-center justify-center gap-0.5 text-amber-400 my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-[11px] text-slate-400">{game.reviewCount}</span>
          </div>

          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 text-slate-400">5</span>
              <div className="flex-1 h-2 bg-[#1b1b1b] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 text-slate-400">4</span>
              <div className="flex-1 h-2 bg-[#1b1b1b] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 text-slate-400">3</span>
              <div className="flex-1 h-2 bg-[#1b1b1b] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '3%' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 text-slate-400">2</span>
              <div className="flex-1 h-2 bg-[#1b1b1b] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '1%' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 text-slate-400">1</span>
              <div className="flex-1 h-2 bg-[#1b1b1b] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '1%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* User Reviews List */}
        <div className="space-y-4">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="p-4 bg-[#232323] rounded-xl border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full ${rev.avatarBg} text-white font-bold text-xs flex items-center justify-center`}
                  >
                    {rev.author[0]}
                  </div>
                  <span className="text-xs font-semibold text-white">{rev.author}</span>
                </div>
                <span className="text-[11px] text-slate-400">{rev.date}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

              <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                <span>Did you find this helpful?</span>
                <button
                  onClick={() => sounds.playClick()}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{rev.likes}</span>
                </button>
              </div>

              {rev.developerResponse && (
                <div className="mt-3 p-3 bg-[#1c1c1c] rounded-lg border-l-2 border-emerald-400 text-xs text-slate-300">
                  <p className="font-semibold text-emerald-400 mb-0.5 text-[11px]">Developer response</p>
                  <p className="text-[11px] text-slate-400">{rev.developerResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Safety & Transparency */}
      <div className="py-6">
        <h2 className="text-sm font-bold text-white mb-2">Data safety</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.
        </p>
        <div className="p-4 bg-[#232323] rounded-xl border border-[#333333] space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No data shared with third parties</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Data is encrypted in transit using modern TLS</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Offline capable with zero tracking telemetry</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Screenshot Modal */}
      {activeScreenshot && (
        <div
          onClick={() => setActiveScreenshot(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={activeScreenshot}
              alt="Screenshot full view"
              className="w-full h-auto rounded-2xl shadow-2xl border border-white/20"
            />
            <p className="text-center text-xs text-slate-400 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}

      {/* Review submission modal */}
      {showReviewModal && (
        <ReviewModal
          gameTitle={game.title}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};
