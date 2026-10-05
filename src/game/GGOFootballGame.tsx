import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Trophy, RotateCcw, ArrowLeft, Volume2, VolumeX, Pause, Play, 
  Flame, Zap, Shield, Sparkles, ChevronRight, Settings, Maximize2, Minimize2
} from 'lucide-react';
import { RobotPlayer, SoccerBall, Particle, MatchPhase, MatchStats, GameMode } from './types';
import { sounds } from './sound';

interface Props {
  onExit: () => void;
  tournamentMode?: boolean;
}

// Virtual field dimensions
const FIELD_WIDTH = 960;
const FIELD_HEIGHT = 580;
const GOAL_HEIGHT = 160;
const GOAL_WIDTH = 28;
const BALL_RADIUS = 9;
const PLAYER_RADIUS = 16;

export const GGOFootballGame: React.FC<Props> = ({ onExit, tournamentMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(tournamentMode ? 'tournament' : 'quick');
  const [tournamentStage, setTournamentStage] = useState<'quarters' | 'semis' | 'finals'>('quarters');
  const [showUpgrades, setShowUpgrades] = useState(false);

  // Upgrades state
  const [credits, setCredits] = useState(1200);
  const [upgrades, setUpgrades] = useState({
    shotPower: 1,
    speed: 1,
    tackleRange: 1,
    goalkeeperReaction: 1,
  });

  // Match HUD states
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [matchTime, setMatchTime] = useState(90); // 90 seconds half
  const [half, setHalf] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<MatchPhase>('playing');
  const [isPaused, setIsPaused] = useState(false);
  const [superGauge, setSuperGauge] = useState(65); // 0 to 100
  const [celebrationText, setCelebrationText] = useState<{ title: string; subtitle: string } | null>(null);
  const [stats, setStats] = useState<MatchStats>({
    shotsHome: 0,
    shotsAway: 0,
    tacklesHome: 0,
    tacklesAway: 0,
    savesHome: 0,
    savesAway: 0,
    possessionHome: 52,
  });

  // Keys active
  const keysRef = useRef<{ [key: string]: boolean }>({});
  // Touch joystick / controls
  const touchMoveRef = useRef<{ active: boolean; dx: number; dy: number }>({ active: false, dx: 0, dy: 0 });

  // Game internal mutable state
  const stateRef = useRef<{
    players: RobotPlayer[];
    ball: SoccerBall;
    particles: Particle[];
    homeScore: number;
    awayScore: number;
    timeLeft: number;
    currentHalf: 1 | 2;
    currentPhase: MatchPhase;
    superGaugeVal: number;
    celebrationTimer: number;
    paused: boolean;
    statsVal: MatchStats;
  }>({
    players: [],
    ball: {
      x: FIELD_WIDTH / 2,
      y: FIELD_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      lastOwnerId: null,
      lastTeam: null,
      isSuperShot: false,
      trail: [],
    },
    particles: [],
    homeScore: 0,
    awayScore: 0,
    timeLeft: 90,
    currentHalf: 1,
    currentPhase: 'playing',
    superGaugeVal: 65,
    celebrationTimer: 0,
    paused: false,
    statsVal: {
      shotsHome: 0,
      shotsAway: 0,
      tacklesHome: 0,
      tacklesAway: 0,
      savesHome: 0,
      savesAway: 0,
      possessionHome: 50,
    },
  });

  // Opponent team name based on tournament stage
  const opponentName = gameMode === 'tournament' 
    ? tournamentStage === 'quarters' ? 'Team Volcano' 
      : tournamentStage === 'semis' ? 'Cyber Iron Wolves' 
      : 'Team Shadow Elite'
    : 'Team Shadow';

  // Initialize players
  const resetField = useCallback((scoringTeam?: 'home' | 'away') => {
    const s = stateRef.current;
    s.ball.x = FIELD_WIDTH / 2;
    s.ball.y = FIELD_HEIGHT / 2;
    s.ball.vx = scoringTeam === 'home' ? -1 : 1;
    s.ball.vy = 0;
    s.ball.lastOwnerId = null;
    s.ball.isSuperShot = false;
    s.ball.trail = [];

    // Home Team: Team Barefoot / GGO Strikers (Starts on left half)
    const homePlayers: RobotPlayer[] = [
      {
        id: 'home-gk',
        name: 'Satellite',
        number: 1,
        role: 'goalkeeper',
        team: 'home',
        x: 60,
        y: FIELD_HEIGHT / 2,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 2.8 + upgrades.goalkeeperReaction * 0.3,
        hasBall: false,
        facingAngle: 0,
        specialSkill: 'Laser Shield',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
      {
        id: 'home-def',
        name: 'Titan',
        number: 4,
        role: 'defender',
        team: 'home',
        x: 210,
        y: FIELD_HEIGHT / 2 + 50,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 3.1 + upgrades.speed * 0.2,
        hasBall: false,
        facingAngle: 0,
        specialSkill: 'Iron Tackle',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
      {
        id: 'home-mid',
        name: 'Isaac (Barefoot)',
        number: 7,
        role: 'midfielder',
        team: 'home',
        x: 340,
        y: FIELD_HEIGHT / 2 - 80,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 3.4 + upgrades.speed * 0.2,
        hasBall: false,
        facingAngle: 0,
        specialSkill: 'Mirage Pass',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
      {
        id: 'home-str',
        name: 'Myth (Lead Striker)',
        number: 10,
        role: 'striker',
        team: 'home',
        x: 430,
        y: FIELD_HEIGHT / 2,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS + 1,
        baseSpeed: 3.8 + upgrades.speed * 0.25,
        hasBall: scoringTeam === 'away',
        facingAngle: 0,
        specialSkill: 'Roaring Flame',
        isControlled: true, // Controlled player by default
        actionCooldown: 0,
        trail: [],
      },
    ];

    // Away Team: Team Shadow / Cyber Titans (Starts on right half)
    const awaySpeedMod = gameMode === 'tournament' 
      ? tournamentStage === 'quarters' ? 0.9 : tournamentStage === 'semis' ? 1.05 : 1.2
      : 1.0;

    const awayPlayers: RobotPlayer[] = [
      {
        id: 'away-gk',
        name: 'Iron Guard',
        number: 1,
        role: 'goalkeeper',
        team: 'away',
        x: FIELD_WIDTH - 60,
        y: FIELD_HEIGHT / 2,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 2.8 * awaySpeedMod,
        hasBall: false,
        facingAngle: Math.PI,
        specialSkill: 'Titan Guard',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
      {
        id: 'away-def',
        name: 'Viper Def',
        number: 3,
        role: 'defender',
        team: 'away',
        x: FIELD_WIDTH - 210,
        y: FIELD_HEIGHT / 2 - 60,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 3.0 * awaySpeedMod,
        hasBall: false,
        facingAngle: Math.PI,
        specialSkill: 'Dark Tackle',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
      {
        id: 'away-mid',
        name: 'Phantom',
        number: 8,
        role: 'midfielder',
        team: 'away',
        x: FIELD_WIDTH - 340,
        y: FIELD_HEIGHT / 2 + 70,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 3.3 * awaySpeedMod,
        hasBall: false,
        facingAngle: Math.PI,
        specialSkill: 'Shadow Step',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
      {
        id: 'away-str',
        name: 'Dark Striker',
        number: 9,
        role: 'striker',
        team: 'away',
        x: FIELD_WIDTH - 430,
        y: FIELD_HEIGHT / 2,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        baseSpeed: 3.6 * awaySpeedMod,
        hasBall: scoringTeam === 'home',
        facingAngle: Math.PI,
        specialSkill: 'Dark Spiral',
        isControlled: false,
        actionCooldown: 0,
        trail: [],
      },
    ];

    s.players = [...homePlayers, ...awayPlayers];
  }, [upgrades, gameMode, tournamentStage]);

  // Restart match completely
  const restartMatch = useCallback(() => {
    const s = stateRef.current;
    s.homeScore = 0;
    s.awayScore = 0;
    s.timeLeft = 90;
    s.currentHalf = 1;
    s.currentPhase = 'playing';
    s.superGaugeVal = 50;
    s.statsVal = {
      shotsHome: 0,
      shotsAway: 0,
      tacklesHome: 0,
      tacklesAway: 0,
      savesHome: 0,
      savesAway: 0,
      possessionHome: 50,
    };
    setScoreHome(0);
    setScoreAway(0);
    setMatchTime(90);
    setHalf(1);
    setPhase('playing');
    setSuperGauge(50);
    setCelebrationText(null);
    setIsPaused(false);
    resetField();
    sounds.playWhistle();
  }, [resetField]);

  // Handle Action: Shoot
  const handleShoot = useCallback((isSuper: boolean = false) => {
    const s = stateRef.current;
    if (s.paused || s.currentPhase !== 'playing') return;

    // Find controlled home player
    const controlled = s.players.find((p) => p.team === 'home' && p.isControlled);
    if (!controlled) return;

    // Distance to ball
    const distToBall = Math.hypot(s.ball.x - controlled.x, s.ball.y - controlled.y);
    if (distToBall > PLAYER_RADIUS + BALL_RADIUS + 14 && !controlled.hasBall) {
      return;
    }

    // Aim towards away goal (x: FIELD_WIDTH, y: center of goal)
    const targetX = FIELD_WIDTH;
    const targetY = FIELD_HEIGHT / 2 + (Math.random() * 80 - 40);

    const angle = Math.atan2(targetY - s.ball.y, targetX - s.ball.x);

    let power = 9.5 + upgrades.shotPower * 1.5;
    if (isSuper) {
      power = 15.5 + upgrades.shotPower * 2.0;
      s.ball.isSuperShot = true;
      s.superGaugeVal = 0;
      setSuperGauge(0);
      sounds.playSuperShot();

      // Spawn burst particles
      for (let i = 0; i < 30; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = Math.random() * 6 + 3;
        s.particles.push({
          x: s.ball.x,
          y: s.ball.y,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed,
          color: i % 2 === 0 ? '#ff4500' : '#ffd700',
          size: Math.random() * 5 + 3,
          life: 0,
          maxLife: 35,
        });
      }
    } else {
      s.ball.isSuperShot = false;
      sounds.playKick();
    }

    s.ball.vx = Math.cos(angle) * power;
    s.ball.vy = Math.sin(angle) * power;
    s.ball.lastOwnerId = controlled.id;
    s.ball.lastTeam = 'home';
    controlled.hasBall = false;

    s.statsVal.shotsHome += 1;
    setStats({ ...s.statsVal });
  }, [upgrades]);

  // Handle Action: Pass
  const handlePass = useCallback(() => {
    const s = stateRef.current;
    if (s.paused || s.currentPhase !== 'playing') return;

    const controlled = s.players.find((p) => p.team === 'home' && p.isControlled);
    if (!controlled) return;

    const distToBall = Math.hypot(s.ball.x - controlled.x, s.ball.y - controlled.y);
    if (distToBall > PLAYER_RADIUS + BALL_RADIUS + 14 && !controlled.hasBall) {
      return;
    }

    // Find best teammate to pass to
    const teammates = s.players.filter((p) => p.team === 'home' && p.id !== controlled.id && p.role !== 'goalkeeper');
    let bestTeammate = teammates[0];
    let maxX = -1;
    for (const tm of teammates) {
      if (tm.x > maxX) {
        maxX = tm.x;
        bestTeammate = tm;
      }
    }

    if (bestTeammate) {
      const angle = Math.atan2(bestTeammate.y - s.ball.y, bestTeammate.x - s.ball.x);
      const power = 7.5;
      s.ball.vx = Math.cos(angle) * power;
      s.ball.vy = Math.sin(angle) * power;
      s.ball.lastOwnerId = controlled.id;
      s.ball.lastTeam = 'home';
      controlled.hasBall = false;
      sounds.playPass();

      // Switch control to teammate
      controlled.isControlled = false;
      bestTeammate.isControlled = true;

      // Add slight super gauge for successful pass
      s.superGaugeVal = Math.min(100, s.superGaugeVal + 8);
      setSuperGauge(Math.round(s.superGaugeVal));
    }
  }, []);

  // Handle Action: Slide Tackle / Sprint
  const handleTackle = useCallback(() => {
    const s = stateRef.current;
    if (s.paused || s.currentPhase !== 'playing') return;

    const controlled = s.players.find((p) => p.team === 'home' && p.isControlled);
    if (!controlled || controlled.actionCooldown > 0) return;

    controlled.actionCooldown = 30; // cooldown frames
    const tackleSpeed = 7.5 + upgrades.tackleRange * 0.8;
    controlled.vx = Math.cos(controlled.facingAngle) * tackleSpeed;
    controlled.vy = Math.sin(controlled.facingAngle) * tackleSpeed;

    sounds.playTackle();

    // Check if near ball or opponent
    const distToBall = Math.hypot(s.ball.x - controlled.x, s.ball.y - controlled.y);
    if (distToBall < PLAYER_RADIUS + BALL_RADIUS + 25) {
      s.ball.vx = Math.cos(controlled.facingAngle) * 6;
      s.ball.vy = Math.sin(controlled.facingAngle) * 6;
      s.ball.lastOwnerId = controlled.id;
      s.ball.lastTeam = 'home';

      s.statsVal.tacklesHome += 1;
      s.superGaugeVal = Math.min(100, s.superGaugeVal + 12);
      setSuperGauge(Math.round(s.superGaugeVal));
      setStats({ ...s.statsVal });
    }
  }, [upgrades]);

  // Trigger Roaring Flame Super Shot
  const handleSuperSkill = useCallback(() => {
    const s = stateRef.current;
    if (s.superGaugeVal >= 100) {
      handleShoot(true);
    }
  }, [handleShoot]);

  // Switch controlled player manually
  const switchControlledPlayer = useCallback(() => {
    const s = stateRef.current;
    const homeFieldPlayers = s.players.filter((p) => p.team === 'home' && p.role !== 'goalkeeper');
    const currentIndex = homeFieldPlayers.findIndex((p) => p.isControlled);
    homeFieldPlayers.forEach((p) => (p.isControlled = false));

    const nextIndex = (currentIndex + 1) % homeFieldPlayers.length;
    homeFieldPlayers[nextIndex].isControlled = true;
    sounds.playClick();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === 'Space' || e.code === 'KeyJ') {
        e.preventDefault();
        handleShoot(false);
      } else if (e.code === 'KeyK' || e.code === 'KeyX') {
        e.preventDefault();
        handlePass();
      } else if (e.code === 'KeyL' || e.code === 'KeyC') {
        e.preventDefault();
        handleTackle();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE') {
        e.preventDefault();
        handleSuperSkill();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        switchControlledPlayer();
      } else if (e.code === 'KeyP') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleShoot, handlePass, handleTackle, handleSuperSkill, switchControlledPlayer]);

  // Initial setup
  useEffect(() => {
    resetField();
    sounds.playWhistle();
  }, [resetField]);

  // Sound mute toggle
  const toggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Main game loop (60 FPS animation frame)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let secondAccumulator = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;

      // Handle match clock when playing
      if (!isPaused && s.currentPhase === 'playing') {
        secondAccumulator += dt;
        if (secondAccumulator >= 1.0) {
          secondAccumulator -= 1.0;
          s.timeLeft -= 1;
          setMatchTime(s.timeLeft);

          // Slowly build super gauge over time
          s.superGaugeVal = Math.min(100, s.superGaugeVal + 0.5);
          setSuperGauge(Math.round(s.superGaugeVal));

          if (s.timeLeft <= 0) {
            if (s.currentHalf === 1) {
              s.currentHalf = 2;
              s.timeLeft = 90;
              s.currentPhase = 'half_time';
              setHalf(2);
              setMatchTime(90);
              setPhase('half_time');
              sounds.playWhistle();
              setTimeout(() => {
                s.currentPhase = 'playing';
                setPhase('playing');
                resetField();
                sounds.playWhistle();
              }, 2500);
            } else {
              s.currentPhase = 'full_time';
              setPhase('full_time');
              sounds.playWhistle();
              sounds.playGoal();
              // Grant credits
              const earned = s.homeScore > s.awayScore ? 600 : 250;
              setCredits((c) => c + earned);
            }
          }
        }
      }

      // Handle goal celebration countdown
      if (s.currentPhase === 'goal_celebration') {
        s.celebrationTimer -= dt;
        if (s.celebrationTimer <= 0) {
          s.currentPhase = 'playing';
          setPhase('playing');
          setCelebrationText(null);
          resetField();
          sounds.playWhistle();
        }
      }

      // -------------------------------------------------------------
      // 1. UPDATE PHYSICS & ENTITIES (only if not paused)
      // -------------------------------------------------------------
      if (!isPaused && s.currentPhase === 'playing') {
        // Controlled player input
        const controlled = s.players.find((p) => p.team === 'home' && p.isControlled);
        if (controlled) {
          let moveX = 0;
          let moveY = 0;

          if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) moveY -= 1;
          if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) moveY += 1;
          if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) moveX -= 1;
          if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) moveX += 1;

          // Touch joystick
          if (touchMoveRef.current.active) {
            moveX = touchMoveRef.current.dx;
            moveY = touchMoveRef.current.dy;
          }

          if (moveX !== 0 || moveY !== 0) {
            const mag = Math.hypot(moveX, moveY);
            controlled.vx = (moveX / mag) * controlled.baseSpeed;
            controlled.vy = (moveY / mag) * controlled.baseSpeed;
            controlled.facingAngle = Math.atan2(moveY, moveX);
          } else {
            controlled.vx *= 0.7;
            controlled.vy *= 0.7;
          }
        }

        // Update all players
        for (const p of s.players) {
          if (p.actionCooldown > 0) p.actionCooldown--;

          // AI behavior for non-controlled players
          if (!p.isControlled) {
            if (p.role === 'goalkeeper') {
              // Goalkeeper stays along goal line and tracks ball Y
              const targetX = p.team === 'home' ? 60 : FIELD_WIDTH - 60;
              const targetY = Math.max(
                FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2 + 15,
                Math.min(FIELD_HEIGHT / 2 + GOAL_HEIGHT / 2 - 15, s.ball.y)
              );

              p.vx = (targetX - p.x) * 0.1;
              p.vy = (targetY - p.y) * 0.12;

              // Save collision with ball
              const distToBall = Math.hypot(s.ball.x - p.x, s.ball.y - p.y);
              if (distToBall < p.radius + s.ball.radius + 6) {
                // Deflect ball forward
                const deflectAngle = p.team === 'home' ? 0 : Math.PI;
                s.ball.vx = Math.cos(deflectAngle) * (6 + Math.random() * 2);
                s.ball.vy = (Math.random() - 0.5) * 6;
                s.ball.isSuperShot = false;
                sounds.playSave();

                if (p.team === 'home') {
                  s.statsVal.savesHome += 1;
                } else {
                  s.statsVal.savesAway += 1;
                }
                setStats({ ...s.statsVal });
              }
            } else if (p.team === 'home') {
              // Teammate AI: position supportively
              let targetX = 0;
              let targetY = 0;

              if (p.role === 'defender') {
                targetX = Math.min(FIELD_WIDTH * 0.45, s.ball.x * 0.5 + 80);
                targetY = FIELD_HEIGHT / 2 + (s.ball.y > FIELD_HEIGHT / 2 ? 60 : -60);
              } else if (p.role === 'midfielder') {
                targetX = s.ball.x * 0.7 + 100;
                targetY = s.ball.y + (p.number === 7 ? -70 : 70);
              }

              const angle = Math.atan2(targetY - p.y, targetX - p.x);
              const dist = Math.hypot(targetX - p.x, targetY - p.y);
              if (dist > 15) {
                p.vx = Math.cos(angle) * p.baseSpeed * 0.85;
                p.vy = Math.sin(angle) * p.baseSpeed * 0.85;
                p.facingAngle = angle;
              } else {
                p.vx *= 0.6;
                p.vy *= 0.6;
              }
            } else if (p.team === 'away') {
              // Opponent AI (Team Shadow)
              let targetX = s.ball.x;
              let targetY = s.ball.y;

              const distToBall = Math.hypot(s.ball.x - p.x, s.ball.y - p.y);

              if (p.role === 'striker') {
                // Striker chases ball aggressively
                if (distToBall < 30) {
                  // In possession! Aim at Home Goal (x: 0)
                  const goalAngle = Math.atan2(FIELD_HEIGHT / 2 - p.y, -p.x);
                  p.facingAngle = goalAngle;

                  // Take shot if in range
                  if (p.x < FIELD_WIDTH * 0.45) {
                    s.ball.vx = -8.5;
                    s.ball.vy = (Math.random() - 0.5) * 5;
                    s.ball.lastOwnerId = p.id;
                    s.ball.lastTeam = 'away';
                    sounds.playKick();
                    s.statsVal.shotsAway += 1;
                    setStats({ ...s.statsVal });
                  } else {
                    // Dribble towards home goal
                    p.vx = Math.cos(goalAngle) * p.baseSpeed;
                    p.vy = Math.sin(goalAngle) * p.baseSpeed;
                  }
                } else {
                  targetX = s.ball.x;
                  targetY = s.ball.y;
                  const angle = Math.atan2(targetY - p.y, targetX - p.x);
                  p.vx = Math.cos(angle) * p.baseSpeed * 0.9;
                  p.vy = Math.sin(angle) * p.baseSpeed * 0.9;
                  p.facingAngle = angle;
                }
              } else if (p.role === 'midfielder') {
                targetX = s.ball.x * 0.8 + 100;
                targetY = s.ball.y * 0.8;
                const angle = Math.atan2(targetY - p.y, targetX - p.x);
                p.vx = Math.cos(angle) * p.baseSpeed * 0.8;
                p.vy = Math.sin(angle) * p.baseSpeed * 0.8;
                p.facingAngle = angle;
              } else if (p.role === 'defender') {
                targetX = Math.max(FIELD_WIDTH * 0.6, s.ball.x + 80);
                targetY = FIELD_HEIGHT / 2 + (s.ball.y - FIELD_HEIGHT / 2) * 0.5;
                const angle = Math.atan2(targetY - p.y, targetX - p.x);
                p.vx = Math.cos(angle) * p.baseSpeed * 0.8;
                p.vy = Math.sin(angle) * p.baseSpeed * 0.8;
                p.facingAngle = angle;
              }
            }
          }

          // Apply position and boundary constraints
          p.x += p.vx;
          p.y += p.vy;

          p.x = Math.max(p.radius + 10, Math.min(FIELD_WIDTH - p.radius - 10, p.x));
          p.y = Math.max(p.radius + 10, Math.min(FIELD_HEIGHT - p.radius - 10, p.y));

          // Player trail for speed
          if (Math.hypot(p.vx, p.vy) > 2.5) {
            p.trail.unshift({ x: p.x, y: p.y, alpha: 0.4 });
            if (p.trail.length > 5) p.trail.pop();
          } else if (p.trail.length > 0) {
            p.trail.pop();
          }

          // Check interaction with ball (dribbling & touch)
          const distToBall = Math.hypot(s.ball.x - p.x, s.ball.y - p.y);
          if (distToBall < p.radius + s.ball.radius) {
            // Ball push / control
            const angle = Math.atan2(s.ball.y - p.y, s.ball.x - p.x);
            s.ball.vx = Math.cos(angle) * (p.baseSpeed * 0.8) + p.vx * 0.4;
            s.ball.vy = Math.sin(angle) * (p.baseSpeed * 0.8) + p.vy * 0.4;
            s.ball.lastOwnerId = p.id;
            s.ball.lastTeam = p.team;

            // Auto-switch control if a home player touches the ball
            if (p.team === 'home' && !p.isControlled && p.role !== 'goalkeeper') {
              s.players.forEach((other) => {
                if (other.team === 'home') other.isControlled = false;
              });
              p.isControlled = true;
            }
          }
        }

        // Update Ball Physics
        s.ball.x += s.ball.vx;
        s.ball.y += s.ball.vy;
        s.ball.vx *= 0.985; // turf rolling resistance
        s.ball.vy *= 0.985;

        // Ball trail for super shot
        if (s.ball.isSuperShot || Math.hypot(s.ball.vx, s.ball.vy) > 8) {
          s.ball.trail.unshift({
            x: s.ball.x,
            y: s.ball.y,
            color: s.ball.isSuperShot ? '#ff4500' : '#00ffff',
            alpha: 0.8,
          });
          if (s.ball.trail.length > 10) s.ball.trail.pop();
        } else if (s.ball.trail.length > 0) {
          s.ball.trail.pop();
        }

        // Particle updates
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          if (pt.life >= pt.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Pitch boundaries and goal checks
        const goalTop = FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2;
        const goalBottom = FIELD_HEIGHT / 2 + GOAL_HEIGHT / 2;

        // Left Goal (Home Goal defended by Satellite, scored by Away)
        if (s.ball.x - s.ball.radius <= 15) {
          if (s.ball.y >= goalTop && s.ball.y <= goalBottom) {
            // GOAL FOR AWAY TEAM!
            s.awayScore += 1;
            setScoreAway(s.awayScore);
            s.currentPhase = 'goal_celebration';
            s.celebrationTimer = 2.4;
            setCelebrationText({
              title: 'GOAL FOR TEAM SHADOW!',
              subtitle: 'Precision robot strike penetrates the defense.',
            });
            sounds.playGoal();
          } else {
            // Bounce off left field boundary
            s.ball.x = 15 + s.ball.radius;
            s.ball.vx = -s.ball.vx * 0.7;
          }
        }

        // Right Goal (Away Goal scored by Home!)
        if (s.ball.x + s.ball.radius >= FIELD_WIDTH - 15) {
          if (s.ball.y >= goalTop && s.ball.y <= goalBottom) {
            // GOAL FOR HOME TEAM (GGO STRIKERS)!
            s.homeScore += 1;
            setScoreHome(s.homeScore);
            s.currentPhase = 'goal_celebration';
            s.celebrationTimer = 2.6;
            const isFlame = s.ball.isSuperShot;
            setCelebrationText({
              title: isFlame ? 'ROARING FLAME GOAL! 🔥' : 'GOAL!! TEAM BAREFOOT!',
              subtitle: isFlame ? 'Myth unleashes an unstoppable flame strike!' : 'Superb combination attack!',
            });
            sounds.playGoal();

            // Fireworks particles
            for (let i = 0; i < 60; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = Math.random() * 8 + 2;
              s.particles.push({
                x: FIELD_WIDTH - 25,
                y: FIELD_HEIGHT / 2,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: ['#00e676', '#ffeb3b', '#ff3d00', '#00e5ff'][i % 4],
                size: Math.random() * 6 + 3,
                life: 0,
                maxLife: 45,
              });
            }
          } else {
            // Bounce off right field boundary
            s.ball.x = FIELD_WIDTH - 15 - s.ball.radius;
            s.ball.vx = -s.ball.vx * 0.7;
          }
        }

        // Top & bottom pitch boundary bounce
        if (s.ball.y - s.ball.radius <= 12) {
          s.ball.y = 12 + s.ball.radius;
          s.ball.vy = -s.ball.vy * 0.7;
        } else if (s.ball.y + s.ball.radius >= FIELD_HEIGHT - 12) {
          s.ball.y = FIELD_HEIGHT - 12 - s.ball.radius;
          s.ball.vy = -s.ball.vy * 0.7;
        }
      }

      // -------------------------------------------------------------
      // 2. RENDER GRAPHICS ON CANVAS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

      // Cyber Soccer Turf with futuristic subtle grid
      ctx.fillStyle = '#0f2416';
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

      // Alternating turf bands
      const bandWidth = FIELD_WIDTH / 10;
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#122b1b' : '#0f2416';
        ctx.fillRect(i * bandWidth, 0, bandWidth, FIELD_HEIGHT);
      }

      // Glowing Neon Pitch Markings
      ctx.strokeStyle = '#2ef7a6';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 6;

      // Outer border
      ctx.strokeRect(20, 20, FIELD_WIDTH - 40, FIELD_HEIGHT - 40);

      // Midfield line
      ctx.beginPath();
      ctx.moveTo(FIELD_WIDTH / 2, 20);
      ctx.lineTo(FIELD_WIDTH / 2, FIELD_HEIGHT - 20);
      ctx.stroke();

      // Center circle & spot
      ctx.beginPath();
      ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#2ef7a6';
      ctx.beginPath();
      ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Penalty areas
      const goalTop = FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2;
      // Home penalty box
      ctx.strokeRect(20, FIELD_HEIGHT / 2 - 120, 110, 240);
      ctx.strokeRect(20, FIELD_HEIGHT / 2 - 60, 45, 120);

      // Away penalty box
      ctx.strokeRect(FIELD_WIDTH - 130, FIELD_HEIGHT / 2 - 120, 110, 240);
      ctx.strokeRect(FIELD_WIDTH - 65, FIELD_HEIGHT / 2 - 60, 45, 120);

      // Goal Nets (3D perspective glowing mesh)
      // Home Goal (Left)
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 180, 216, 0.15)';
      ctx.fillRect(0, goalTop, 20, GOAL_HEIGHT);
      ctx.strokeStyle = '#00b4d8';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, goalTop, 20, GOAL_HEIGHT);

      // Away Goal (Right)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(FIELD_WIDTH - 20, goalTop, 20, GOAL_HEIGHT);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(FIELD_WIDTH - 20, goalTop, 20, GOAL_HEIGHT);

      // Draw Ball Trails (Super Shot Flame)
      if (s.ball.trail.length > 0) {
        for (let i = 0; i < s.ball.trail.length; i++) {
          const t = s.ball.trail[i];
          ctx.beginPath();
          ctx.arc(t.x, t.y, BALL_RADIUS * (1 - i / s.ball.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = t.color;
          ctx.globalAlpha = t.alpha * (1 - i / s.ball.trail.length);
          ctx.shadowColor = t.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      // Draw Particles
      for (const pt of s.particles) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = 1 - pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Draw Players
      for (const p of s.players) {
        // Player speed trails
        for (let i = 0; i < p.trail.length; i++) {
          const tr = p.trail[i];
          ctx.fillStyle = p.team === 'home' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 61, 0, 0.2)';
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, p.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Controlled player indicator glow & reticle
        if (p.isControlled) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ffeb3b';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
          ctx.stroke();

          // Controlled arrow pointer
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.radius - 12);
          ctx.lineTo(p.x - 6, p.y - p.radius - 20);
          ctx.lineTo(p.x + 6, p.y - p.radius - 20);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Robot Chassis Circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.team === 'home') {
          // Team Barefoot (GGO Cyber Blue & Gold)
          ctx.fillStyle = p.role === 'goalkeeper' ? '#00e5ff' : '#0284c7';
          ctx.strokeStyle = p.role === 'striker' ? '#fbbf24' : '#38bdf8';
        } else {
          // Team Shadow (Crimson & Steel)
          ctx.fillStyle = p.role === 'goalkeeper' ? '#991b1b' : '#dc2626';
          ctx.strokeStyle = '#f87171';
        }
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        // Facing direction visor / eye laser
        const eyeX = p.x + Math.cos(p.facingAngle) * (p.radius * 0.65);
        const eyeY = p.y + Math.sin(p.facingAngle) * (p.radius * 0.65);
        ctx.fillStyle = p.team === 'home' ? '#00ffff' : '#ff0055';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Player Number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.number.toString(), p.x, p.y);

        // Player Name Tag
        ctx.font = '10px sans-serif';
        ctx.fillStyle = p.isControlled ? '#ffd700' : 'rgba(255,255,255,0.8)';
        ctx.fillText(p.name.split(' ')[0], p.x, p.y + p.radius + 12);
      }

      // Draw Ball
      ctx.shadowColor = s.ball.isSuperShot ? '#ff4500' : '#ffffff';
      ctx.shadowBlur = s.ball.isSuperShot ? 16 : 4;
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, s.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.ball.isSuperShot ? '#ff4500' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ball internal soccer pentagon pattern
      if (!s.ball.isSuperShot) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(s.ball.x, s.ball.y, s.ball.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, resetField]);

  // Touch joystick controls
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    touchMoveRef.current = { active: true, dx, dy };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    touchMoveRef.current = { active: true, dx, dy };
  };

  const handleTouchEnd = () => {
    touchMoveRef.current = { active: false, dx: 0, dy: 0 };
  };

  return (
    <div className="relative w-full min-h-screen bg-[#0a0f0d] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Game Bar */}
      <div className="h-14 bg-[#141e17] border-b border-[#203626] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1b2b20] hover:bg-[#253d2d] rounded-lg transition-colors text-emerald-400 border border-emerald-900/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Play Store</span>
          </button>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">·</span>
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="text-emerald-400">GGO FOOTBALL</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono">
              AI LEAGUE
            </span>
          </span>
        </div>

        {/* Center Scoreboard & Match Clock */}
        <div className="flex items-center gap-3 bg-[#0d1610] px-4 py-1.5 rounded-xl border border-emerald-950">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400">BAREFOOT</span>
            <span className="font-mono text-lg font-black text-white">{scoreHome}</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-black text-white">{scoreAway}</span>
            <span className="text-xs font-bold text-rose-400">{opponentName.toUpperCase()}</span>
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
            <span>H{half}</span>
            <span>{Math.floor(matchTime / 60)}:{(matchTime % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpgrades(!showUpgrades)}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-[#1b2b20] rounded-lg transition-colors"
            title="Robot Lab & Upgrades"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-[#1b2b20] rounded-lg transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-[#1b2b20] rounded-lg transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-[#1b2b20] rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Arena Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 relative bg-[#070b09]">
        {/* Super Move Energy Bar */}
        <div className="w-full max-w-4xl px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>GGO Super Move Gauge</span>
            </span>
            <div className="w-36 sm:w-56 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  superGauge >= 100
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${superGauge}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-slate-300">
              {superGauge >= 100 ? 'READY 🔥' : `${superGauge}%`}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Active Striker: <strong className="text-white">Myth #10</strong></span>
            <span>·</span>
            <span>Credits: <strong className="text-amber-400 font-mono">{credits} C</strong></span>
          </div>
        </div>

        {/* Canvas Stadium Field */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e3a27] shadow-[0_0_50px_rgba(0,230,118,0.15)] max-w-5xl w-full aspect-[960/580] bg-black">
          <canvas
            ref={canvasRef}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            className="w-full h-full block"
          />

          {/* Goal celebration overlay */}
          {celebrationText && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
              <div className="bg-[#112418] border-2 border-emerald-400/80 px-8 py-5 rounded-2xl text-center shadow-[0_0_40px_rgba(16,185,129,0.5)] transform scale-105">
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400 tracking-wider">
                  {celebrationText.title}
                </span>
                <p className="text-sm text-emerald-200 mt-2 font-medium">
                  {celebrationText.subtitle}
                </p>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <div className="bg-[#142319] border border-emerald-800 p-6 rounded-2xl max-w-md w-full text-center">
                <h3 className="text-xl font-bold text-white mb-2">Match Paused</h3>
                <p className="text-xs text-slate-300 mb-6">Take a tactical timeout to recalibrate your robotic squad.</p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors text-white"
                  >
                    Resume Match
                  </button>
                  <button
                    onClick={restartMatch}
                    className="w-full py-2.5 bg-[#1e3425] hover:bg-[#284732] font-semibold text-xs rounded-lg transition-colors text-slate-200"
                  >
                    Restart Match
                  </button>
                  <button
                    onClick={onExit}
                    className="w-full py-2.5 bg-transparent hover:bg-white/5 font-semibold text-xs text-slate-400 rounded-lg transition-colors"
                  >
                    Return to Play Store
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Time / Game Over Overlay */}
          {phase === 'full_time' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-30">
              <div className="bg-[#14241a] border-2 border-emerald-500/70 p-6 rounded-2xl max-w-lg w-full text-center shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {scoreHome > scoreAway ? 'VICTORY! TEAM BAREFOOT WINS!' : scoreHome === scoreAway ? 'DRAW MATCH!' : 'DEFEAT - TEAM SHADOW WINS'}
                </h2>
                <p className="text-xs text-slate-300 mt-1 mb-5">
                  {scoreHome > scoreAway
                    ? 'Congratulations! Myth and the AI robots have conquered the field!'
                    : 'Analyze performance telemetries and upgrade your robotic cores to strike back.'}
                </p>

                {/* Match Stats Table */}
                <div className="grid grid-cols-3 gap-2 bg-[#0c1610] p-4 rounded-xl text-xs mb-5 border border-emerald-950">
                  <div className="text-right">
                    <span className="font-bold text-sky-400 block mb-1">Barefoot</span>
                    <div className="font-mono text-white space-y-1">
                      <p>{scoreHome}</p>
                      <p>{stats.shotsHome}</p>
                      <p>{stats.tacklesHome}</p>
                      <p>{stats.savesHome}</p>
                    </div>
                  </div>
                  <div className="text-center text-slate-400">
                    <span className="font-semibold block mb-1">METRIC</span>
                    <div className="space-y-1 text-slate-400">
                      <p>Goals</p>
                      <p>Shots</p>
                      <p>Tackles</p>
                      <p>Saves</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-rose-400 block mb-1">Shadow</span>
                    <div className="font-mono text-white space-y-1">
                      <p>{scoreAway}</p>
                      <p>{stats.shotsAway}</p>
                      <p>{stats.tacklesAway}</p>
                      <p>{stats.savesAway}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={restartMatch}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                  <button
                    onClick={onExit}
                    className="flex-1 py-2.5 bg-[#203626] hover:bg-[#2d4d36] text-white font-semibold text-xs rounded-xl transition-colors"
                  >
                    Back to Play Store
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Game Action Bar (Touch & Click Friendly) */}
        <div className="w-full max-w-5xl mt-3 flex flex-wrap items-center justify-between gap-2 px-2">
          {/* Virtual Joystick or Keyboard hints */}
          <div className="flex items-center gap-3">
            {/* Onscreen touch D-Pad */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-20 h-20 rounded-full bg-[#142318] border border-emerald-900/60 flex items-center justify-center relative touch-none select-none cursor-pointer active:bg-emerald-950"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600/70 border border-emerald-400" />
              <span className="absolute text-[9px] text-slate-400 font-bold uppercase pointer-events-none">MOVE</span>
            </div>

            {/* Desktop Keyboard Cheatsheet */}
            <div className="hidden md:flex flex-col text-[11px] text-slate-400 gap-0.5">
              <span className="font-semibold text-slate-300">Keyboard Controls:</span>
              <span><strong className="text-white">WASD / Arrows</strong>: Move Robot</span>
              <span><strong className="text-white">Space / J</strong>: Shoot · <strong className="text-white">K / X</strong>: Pass · <strong className="text-white">L / C</strong>: Tackle</span>
              <span><strong className="text-amber-400">Shift / E</strong>: Roaring Flame Super Shot</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShoot(false)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>SHOOT [J]</span>
            </button>

            <button
              onClick={handlePass}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>PASS [K]</span>
            </button>

            <button
              onClick={handleTackle}
              className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>TACKLE [L]</span>
            </button>

            <button
              onClick={handleSuperSkill}
              disabled={superGauge < 100}
              className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5 ${
                superGauge >= 100
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white animate-bounce ring-2 ring-yellow-400 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>ROARING FLAME [E]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrades & Robot Customization Modal */}
      {showUpgrades && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#142319] border border-emerald-700/60 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">GGO Robotics Lab</h3>
              </div>
              <div className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-900/40">
                {credits} Credits
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {/* Shot Power */}
              <div className="flex items-center justify-between bg-[#0e1911] p-3 rounded-xl border border-emerald-950">
                <div>
                  <h4 className="text-xs font-bold text-white">Striker Shot Power</h4>
                  <p className="text-[11px] text-slate-400">Increases Myth's kick velocity and curve.</p>
                </div>
                <button
                  disabled={credits < 300 || upgrades.shotPower >= 5}
                  onClick={() => {
                    setCredits((c) => c - 300);
                    setUpgrades((u) => ({ ...u, shotPower: u.shotPower + 1 }));
                    sounds.playClick();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-white"
                >
                  Lvl {upgrades.shotPower} (300 C)
                </button>
              </div>

              {/* Speed Boost */}
              <div className="flex items-center justify-between bg-[#0e1911] p-3 rounded-xl border border-emerald-950">
                <div>
                  <h4 className="text-xs font-bold text-white">Chassis Micro-Motors</h4>
                  <p className="text-[11px] text-slate-400">Boosts top speed for all team robots.</p>
                </div>
                <button
                  disabled={credits < 300 || upgrades.speed >= 5}
                  onClick={() => {
                    setCredits((c) => c - 300);
                    setUpgrades((u) => ({ ...u, speed: u.speed + 1 }));
                    sounds.playClick();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-white"
                >
                  Lvl {upgrades.speed} (300 C)
                </button>
              </div>

              {/* Tackle Range */}
              <div className="flex items-center justify-between bg-[#0e1911] p-3 rounded-xl border border-emerald-950">
                <div>
                  <h4 className="text-xs font-bold text-white">Titan Heavy Tackle Core</h4>
                  <p className="text-[11px] text-slate-400">Widens ball interception radius.</p>
                </div>
                <button
                  disabled={credits < 250 || upgrades.tackleRange >= 5}
                  onClick={() => {
                    setCredits((c) => c - 250);
                    setUpgrades((u) => ({ ...u, tackleRange: u.tackleRange + 1 }));
                    sounds.playClick();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-white"
                >
                  Lvl {upgrades.tackleRange} (250 C)
                </button>
              </div>

              {/* Goalkeeper Reaction */}
              <div className="flex items-center justify-between bg-[#0e1911] p-3 rounded-xl border border-emerald-950">
                <div>
                  <h4 className="text-xs font-bold text-white">Satellite Laser AI</h4>
                  <p className="text-[11px] text-slate-400">Accelerates goalkeeper save reaction speed.</p>
                </div>
                <button
                  disabled={credits < 250 || upgrades.goalkeeperReaction >= 5}
                  onClick={() => {
                    setCredits((c) => c - 250);
                    setUpgrades((u) => ({ ...u, goalkeeperReaction: u.goalkeeperReaction + 1 }));
                    sounds.playClick();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-white"
                >
                  Lvl {upgrades.goalkeeperReaction} (250 C)
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowUpgrades(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-white"
            >
              Confirm Upgrades
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
