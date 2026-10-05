import { GameItem } from '../types/store';

export const GGO_FOOTBALL_GAME: GameItem = {
  id: 'ggo-football',
  title: 'GGO Football: AI Robo League',
  shortTitle: 'GGO Football',
  tagline: 'Lead Myth & Team Barefoot in futuristic 5v5 AI robot football showdowns!',
  category: 'Sports · Action · Anime',
  genre: 'Sports',
  rating: 4.8,
  reviewCount: '1.24M reviews',
  downloads: '100M+',
  downloadCountNum: 100000000,
  size: '64 MB',
  sizeMB: 64,
  ageRating: 'Rated for 3+',
  editorChoice: true,
  developer: 'Hyper AI Interactive · Official GGO Studio',
  iconUrl: '/src/assets/images/ggo_football_icon_1791178804456.jpg',
  bannerUrl: '/src/assets/images/ggo_football_banner_1791178816231.jpg',
  screenshots: [
    '/src/assets/images/ggo_football_banner_1791178816231.jpg',
    '/src/assets/images/ggo_football_screen1_1791178828866.jpg',
    '/src/assets/images/ggo_football_screen2_1791178840810.jpg',
  ],
  description: `Step into the electrified stadiums of the 21st-century GGO Football World Cup! Control high-performance AI soccer robots engineered with supreme micro-drives and hyper-reactive neural cores.

Team up with legendary controller Isaac and command your striker "Myth" as you execute devastating special skills like the Roaring Flame Shot, Mirage Dribble, and Satellite Tackle. Defeat rival teams from around the globe, upgrade your robotic chassis, and lift the GGO World Championship Trophy!

Features:
• Real-time high-speed robot football physics with authentic ball bouncing and trajectory curves
• Devastating Super Shots with energy-burst cinematic cutscenes and audio
• Formations & AI tactics: Switch between 3-1-1 Offensive and 2-2-1 Fortress setups
• Controller Sync: Responsive on-screen virtual controls and full keyboard support
• Multi-round GGO Tournament Cup & Quick Match modes
• 100% offline playable anytime after download!`,
  whatsNew: `Version 3.4.0 Update:
• Added "Roaring Flame Shot EX" trajectory trail effect
• Enhanced goalkeeper Satellite AI laser response times
• Added Tournament Cup Championship mode with trophy celebrations
• Optimized memory footprint to silky-smooth 60 FPS on all devices
• Offline play capability enabled right inside the app!`,
  features: [
    'Authentic AI Football GGO anime universe',
    'Real interactive match gameplay',
    'Special power moves & particle effects',
    'Championship tournament bracket',
    'Custom team formations & robot upgrades',
    'Offline mode with zero latency',
  ],
  reviews: [
    {
      id: 'rev-1',
      author: 'Marcus Vance',
      avatarBg: 'bg-emerald-600',
      rating: 5,
      date: 'October 1, 2026',
      comment: 'Finally a real GGO Football game! Myth\'s Roaring Flame shot looks and feels just like the anime. The controls are snappy and responsive. Scoring in the top corner against Team Shadow feels so satisfying!',
      likes: 342,
      developerResponse: 'Thank you Marcus! Keep mastering Myth and Isaac\'s combination plays. More special moves are coming in the next patch!',
    },
    {
      id: 'rev-2',
      author: 'Sora Takahashi',
      avatarBg: 'bg-blue-600',
      rating: 5,
      date: 'September 28, 2026',
      comment: 'Awesome game! Love the fact you can play offline right away once downloaded. Titan\'s slide tackle has saved me from conceding goals so many times. 5 stars all the way!',
      likes: 189,
    },
    {
      id: 'rev-3',
      author: 'David Chen',
      avatarBg: 'bg-purple-600',
      rating: 4,
      date: 'September 24, 2026',
      comment: 'Super fun robot soccer game! The AI is surprisingly smart on high difficulty. Would love to see more stadiums and rain weather effects, but overall one of the best football games on the store.',
      likes: 95,
      developerResponse: 'Thanks David! Neon Rain Arena is currently in our development roadmap for the next season update.',
    },
    {
      id: 'rev-4',
      author: 'Liam O\'Connor',
      avatarBg: 'bg-amber-600',
      rating: 5,
      date: 'September 15, 2026',
      comment: 'Childhood dream fulfilled! AI Football GGO was my favorite series growing up. The physics feel tight, pass button is accurate, and the Super Gauge adds awesome tactical depth.',
      likes: 78,
    },
  ],
  isPlayable: true,
};

export const STORE_GAMES: GameItem[] = [
  GGO_FOOTBALL_GAME,
  {
    id: 'cyber-striker-pro',
    title: 'Cyber Striker 2026',
    shortTitle: 'Cyber Striker',
    tagline: 'Futuristic street soccer league with cybernetic enhancements.',
    category: 'Sports · Arcade',
    genre: 'Sports',
    rating: 4.6,
    reviewCount: '480K reviews',
    downloads: '10M+',
    downloadCountNum: 10000000,
    size: '52 MB',
    sizeMB: 52,
    ageRating: 'Rated for 3+',
    editorChoice: false,
    developer: 'NeoPulse Sports',
    iconUrl: '/src/assets/images/ggo_football_icon_1791178804456.jpg',
    bannerUrl: '/src/assets/images/ggo_football_screen1_1791178828866.jpg',
    screenshots: [
      '/src/assets/images/ggo_football_screen1_1791178828866.jpg',
      '/src/assets/images/ggo_football_screen2_1791178840810.jpg',
    ],
    description: 'Battle in underground neon football arenas with cybernetic upgrades and power shots.',
    whatsNew: 'New stadium arena unlocked!',
    features: ['Street football rules', 'Special kick powers', 'Custom kits'],
    reviews: [
      {
        id: 'cs-1',
        author: 'Tyler Reed',
        avatarBg: 'bg-indigo-600',
        rating: 5,
        date: 'September 10, 2026',
        comment: 'Very cool companion game to GGO Football with fast-paced matches!',
        likes: 45,
      },
    ],
    isPlayable: false,
  },
  {
    id: 'inazuma-robo-clash',
    title: 'Robo Strikers Championship',
    shortTitle: 'Robo Strikers',
    tagline: 'Assemble your robotic squad and dominate the galactic league.',
    category: 'Action · Sports',
    genre: 'Sports',
    rating: 4.7,
    reviewCount: '890K reviews',
    downloads: '50M+',
    downloadCountNum: 50000000,
    size: '58 MB',
    sizeMB: 58,
    ageRating: 'Rated for 7+',
    editorChoice: true,
    developer: 'MechaPlay Studios',
    iconUrl: '/src/assets/images/ggo_football_icon_1791178804456.jpg',
    bannerUrl: '/src/assets/images/ggo_football_screen2_1791178840810.jpg',
    screenshots: [
      '/src/assets/images/ggo_football_screen2_1791178840810.jpg',
      '/src/assets/images/ggo_football_banner_1791178816231.jpg',
    ],
    description: 'Build your robotic dream team, customize processor cores, and play tournament matches.',
    whatsNew: 'Added 5 new robot striker models and turbo boosts.',
    features: ['Custom bot builds', 'Rocket boosts', 'Online leaderboard'],
    reviews: [
      {
        id: 'rb-1',
        author: 'Alex Gomez',
        avatarBg: 'bg-rose-600',
        rating: 4,
        date: 'August 30, 2026',
        comment: 'Great mechanics and nice graphics.',
        likes: 29,
      },
    ],
    isPlayable: false,
  },
  {
    id: 'penalty-blitz-ai',
    title: 'Penalty Blitz: GGO Edition',
    shortTitle: 'Penalty Blitz',
    tagline: 'Test your reaction times in high-voltage robot penalty shootouts.',
    category: 'Sports · Casual',
    genre: 'Sports',
    rating: 4.5,
    reviewCount: '310K reviews',
    downloads: '5M+',
    downloadCountNum: 5000000,
    size: '38 MB',
    sizeMB: 38,
    ageRating: 'Rated for 3+',
    editorChoice: false,
    developer: 'Hyper AI Interactive',
    iconUrl: '/src/assets/images/ggo_football_icon_1791178804456.jpg',
    bannerUrl: '/src/assets/images/ggo_football_banner_1791178816231.jpg',
    screenshots: [
      '/src/assets/images/ggo_football_screen1_1791178828866.jpg',
    ],
    description: 'Precision swipe and shoot penalty practice featuring goalkeeper Satellite and Myth.',
    whatsNew: 'Curve shot precision tuned for high-refresh screens.',
    features: ['Swipe physics', 'Laser targets', 'Daily shootout challenges'],
    reviews: [
      {
        id: 'pb-1',
        author: 'Kevin Scott',
        avatarBg: 'bg-teal-600',
        rating: 5,
        date: 'July 18, 2026',
        comment: 'Addictive quick minigame to play during breaks!',
        likes: 18,
      },
    ],
    isPlayable: false,
  },
];
