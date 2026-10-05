import React from 'react';
import { Download, X, Trash2, Play, HardDrive, CheckCircle2, ShieldCheck, FileDown } from 'lucide-react';
import { GameItem, ActiveDownload } from '../types/store';
import { sounds } from '../game/sound';

interface Props {
  activeDownloads: ActiveDownload[];
  installedGameIds: string[];
  games: GameItem[];
  onClose: () => void;
  onPlayGame: (game: GameItem) => void;
  onUninstallGame: (gameId: string) => void;
  onCancelDownload: (gameId: string) => void;
}

export const DownloadManagerModal: React.FC<Props> = ({
  activeDownloads,
  installedGameIds,
  games,
  onClose,
  onPlayGame,
  onUninstallGame,
  onCancelDownload,
}) => {
  const installedGames = games.filter((g) => installedGameIds.includes(g.id));

  // Export real offline standalone HTML game bundle to user's disk
  const handleExportOfflineGame = (game: GameItem) => {
    sounds.playClick();
    const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${game.title} - Offline Edition</title>
  <style>
    body { margin: 0; background: #070b09; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    h1 { color: #00e676; margin-bottom: 5px; font-size: 28px; }
    p { color: #888; font-size: 14px; margin-bottom: 20px; }
    #canvas { border: 2px solid #2ef7a6; border-radius: 12px; box-shadow: 0 0 30px rgba(0,230,118,0.3); background: #0f2416; }
    .hud { font-weight: bold; margin-bottom: 10px; color: #ffeb3b; }
  </style>
</head>
<body>
  <h1>${game.title}</h1>
  <p>Offline Standalone Game Package · Installed via Google Play</p>
  <div class="hud">Use Arrow Keys / WASD to Move · Space to Shoot · J to Pass · Shift for Roaring Flame Shot</div>
  <canvas id="canvas" width="800" height="500"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let ball = { x: 400, y: 250, vx: 0, vy: 0, r: 8 };
    let player = { x: 200, y: 250, r: 15, speed: 4 };
    let bot = { x: 600, y: 250, r: 15, speed: 3 };
    let keys = {};
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    function loop() {
      if (keys['w'] || keys['arrowup']) player.y -= player.speed;
      if (keys['s'] || keys['arrowdown']) player.y += player.speed;
      if (keys['a'] || keys['arrowleft']) player.x -= player.speed;
      if (keys['d'] || keys['arrowright']) player.x += player.speed;

      // Bot tracks ball
      if (bot.y < ball.y) bot.y += bot.speed * 0.8;
      if (bot.y > ball.y) bot.y -= bot.speed * 0.8;

      // Ball kick
      let dist = Math.hypot(ball.x - player.x, ball.y - player.y);
      if (dist < player.r + ball.r) {
        ball.vx = 8;
        ball.vy = (Math.random() - 0.5) * 4;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vx *= 0.98;
      ball.vy *= 0.98;

      if (ball.x < 10 || ball.x > 790) ball.vx *= -1;
      if (ball.y < 10 || ball.y > 490) ball.vy *= -1;

      // Draw
      ctx.fillStyle = '#0f2416';
      ctx.fillRect(0,0,800,500);
      ctx.strokeStyle = '#2ef7a6';
      ctx.strokeRect(20,20,760,460);
      // Midfield
      ctx.beginPath(); ctx.moveTo(400,20); ctx.lineTo(400,480); ctx.stroke();
      ctx.beginPath(); ctx.arc(400,250,50,0,Math.PI*2); ctx.stroke();

      // Draw Player
      ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2); ctx.fill();
      // Draw Bot
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(bot.x, bot.y, bot.r, 0, Math.PI*2); ctx.fill();
      // Draw Ball
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

    const blob = new Blob([offlineHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GGO_Football_Offline_Game.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#353535]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Download Manager & Library</h2>
              <p className="text-xs text-slate-400">Manage installed packages, updates, and offline storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#333333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Active Downloads Section */}
          {activeDownloads.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                Active Downloads ({activeDownloads.length})
              </h3>
              <div className="space-y-3">
                {activeDownloads.map((dl) => {
                  const game = games.find((g) => g.id === dl.gameId);
                  if (!game) return null;
                  return (
                    <div
                      key={dl.gameId}
                      className="bg-[#1c1c1c] border border-[#353535] rounded-xl p-3.5 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.iconUrl}
                            alt={game.title}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">{game.title}</p>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {dl.status === 'verifying'
                                ? 'Verifying package checksum...'
                                : `${dl.downloadedMB.toFixed(1)} MB of ${dl.totalMB} MB · ${dl.speedMBs} MB/s`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onCancelDownload(dl.gameId)}
                          className="text-xs text-slate-400 hover:text-rose-400 p-1"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                          style={{ width: `${dl.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Installed Games Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Installed Games ({installedGames.length})
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span>
                  Storage: {installedGames.reduce((acc, g) => acc + g.sizeMB, 0)} MB used
                </span>
              </div>
            </div>

            {installedGames.length === 0 ? (
              <div className="text-center py-8 bg-[#1c1c1c] rounded-xl border border-dashed border-[#353535]">
                <Download className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">No games installed yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Browse the store and install GGO Football to play instantly!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {installedGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-[#1c1c1c] border border-[#353535] rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={game.iconUrl}
                        alt={game.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Installed · {game.size}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400">Ready to play</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Export offline standalone game package */}
                      <button
                        onClick={() => handleExportOfflineGame(game)}
                        className="p-2 bg-[#2c2c2c] hover:bg-[#363636] text-slate-300 hover:text-emerald-400 rounded-lg text-xs transition-colors flex items-center gap-1"
                        title="Download Standalone Offline Game File (HTML/APK package)"
                      >
                        <FileDown className="w-4 h-4 text-emerald-400" />
                        <span className="hidden sm:inline text-[11px]">Save File</span>
                      </button>

                      {/* Play Button */}
                      <button
                        onClick={() => {
                          onPlayGame(game);
                          sounds.playClick();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play</span>
                      </button>

                      {/* Uninstall Button */}
                      <button
                        onClick={() => onUninstallGame(game.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Uninstall"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#353535] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Play Protect verified · Scanned 0 minutes ago</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#333333] hover:bg-[#3d3d3d] text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
