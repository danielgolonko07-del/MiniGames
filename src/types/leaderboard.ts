export interface LeaderboardPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

export interface LeaderboardMeta {
  totalItems: number;
  description: string;
}

export interface LeaderboardResponse {
  data: LeaderboardPlayer[];
  meta: LeaderboardMeta;
}