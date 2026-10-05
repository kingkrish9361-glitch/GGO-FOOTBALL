export interface GameReview {
  id: string;
  author: string;
  avatarBg: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  developerResponse?: string;
}

export interface GameItem {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  category: string;
  genre: string;
  rating: number;
  reviewCount: string;
  downloads: string;
  downloadCountNum: number;
  size: string;
  sizeMB: number;
  ageRating: string;
  editorChoice: boolean;
  developer: string;
  iconUrl: string;
  bannerUrl: string;
  screenshots: string[];
  description: string;
  whatsNew: string;
  features: string[];
  reviews: GameReview[];
  isPlayable: boolean;
}

export type DownloadStatus = 'idle' | 'downloading' | 'verifying' | 'installed';

export interface ActiveDownload {
  gameId: string;
  progress: number; // 0 to 100
  downloadedMB: number;
  totalMB: number;
  speedMBs: number;
  status: DownloadStatus;
}
