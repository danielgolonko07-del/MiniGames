export interface GameRecord {
  id: string;
  playerName: string;
  score: number;
  createdAt?: string;
}

export interface GameDetails {
  slug: string;
  name: string;
  category: string;
  price: string;

  description: string;

  rating: number;
  likesCount: number;

  heroImage: string;

  players: string;
  duration: string;

  topRecords: GameRecord[];

  isLikedByCurrentUser: boolean;
}

export interface GameComment {
  id: string;

  authorName: string;

  text: string;

  likesCount: number;

  createdAt: string;
}

export interface GameComments {
  comments: GameComment[];

  totalItems: number;
}
