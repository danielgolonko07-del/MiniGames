import type {
  CategoriesResponse,
  Game,
  GamesResponse,
  LibraryGamesQuery,
  LibraryGamesResponse,
} from '../types/game';

const API_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

/*
  HOME SLIDER
*/

export async function getFeaturedGames(): Promise<Game[]> {
  const result = await requestJson<GamesResponse>(`${API_URL}/games?featured=true`);

  return result.data;
}

/*
  LIBRARY CATEGORIES
*/

export async function getCategories(): Promise<CategoriesResponse> {
  return requestJson<CategoriesResponse>(`${API_URL}/categories`);
}

/*
  LIBRARY GAMES
*/

export async function getLibraryGames(query: LibraryGamesQuery): Promise<LibraryGamesResponse> {
  const parameters = new URLSearchParams({
    category: query.category,
    sort: query.sort,
    page: String(query.page),
    limit: String(query.limit),
  });

  return requestJson<LibraryGamesResponse>(
    `${API_URL}/games?${parameters.toString()}`,
    query.signal,
  );
}
