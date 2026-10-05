export type PlayerRole = 'striker' | 'midfielder' | 'defender' | 'goalkeeper';
export type TeamSide = 'home' | 'away';

export interface RobotPlayer {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  team: TeamSide;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseSpeed: number;
  hasBall: boolean;
  facingAngle: number;
  specialSkill: string;
  isControlled: boolean;
  actionCooldown: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

export interface SoccerBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lastOwnerId: string | null;
  lastTeam: TeamSide | null;
  isSuperShot: boolean;
  trail: Array<{ x: number; y: number; color: string; alpha: number }>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export type MatchPhase = 'kickoff' | 'playing' | 'goal_celebration' | 'half_time' | 'full_time';

export interface MatchStats {
  shotsHome: number;
  shotsAway: number;
  tacklesHome: number;
  tacklesAway: number;
  savesHome: number;
  savesAway: number;
  possessionHome: number;
}

export type GameMode = 'quick' | 'tournament' | 'practice';

export interface TeamSettings {
  teamName: string;
  primaryColor: string;
  secondaryColor: string;
  formation: '3-1-1' | '2-2-1' | '1-3-1';
  difficulty: 'easy' | 'normal' | 'pro';
}
