export interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

export interface GamesResponse {
  data: Game[];
  meta?: {
    totalItems?: number;
    featuredCount?: number;
    description?: string;
  };
}

export type SortValue = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

export interface GameCategory {
  slug: string;
  label: string;
  isDefault: boolean;
}

export interface CategoriesResponse {
  data: GameCategory[];
  meta: {
    totalItems: number;
    description: string;
  };
}

export interface LibraryGamesMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface LibraryGamesResponse {
  data: Game[];
  meta: LibraryGamesMeta;
}

export interface LibraryGamesQuery {
  category: string;
  sort: SortValue;
  page: number;
  limit: number;
  signal?: AbortSignal;
}
