import React from 'react';
import { Star, Download, Play, ShieldCheck } from 'lucide-react';
import { GameItem, DownloadStatus } from '../types/store';
import { sounds } from '../game/sound';

interface Props {
  game: GameItem;
  downloadStatus: DownloadStatus;
  onSelect: (game: GameItem) => void;
  onQuickPlay?: (game: GameItem) => void;
  onQuickInstall?: (game: GameItem) => void;
}

export const GameCard: React.FC<Props> = ({
  game,
  downloadStatus,
  onSelect,
  onQuickPlay,
  onQuickInstall,
}) => {
  return (
    <div
      onClick={() => {
        onSelect(game);
        sounds.playClick();
      }}
      className="group bg-[#242424] hover:bg-[#2b2b2b] border border-[#333333] hover:border-[#444444] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex gap-3.5 items-start">
          {/* Game Icon */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#181818] border border-white/10 shrink-0 shadow-md">
            <img
              src={game.iconUrl}
              alt={game.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
              {game.title}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{game.developer}</p>

            {/* Zero-Pill Unboxed Metadata */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1 text-slate-200 font-medium">
                <span>{game.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{game.size}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{game.downloads}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
          {game.tagline}
        </p>
      </div>

      {/* Footer Status / Quick Button */}
      <div className="mt-4 pt-3 border-t border-[#303030] flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">
          {game.category.split('·')[0]}
        </span>

        {downloadStatus === 'installed' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickPlay) onQuickPlay(game);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play</span>
          </button>
        ) : downloadStatus === 'downloading' ? (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Downloading...</span>
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickInstall) onQuickInstall(game);
              else onSelect(game);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#323232] hover:bg-[#3d3d3d] text-emerald-400 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-emerald-900/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}
      </div>
    </div>
  );
};
